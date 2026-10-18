# Refactor plan: Hexagonal architecture (Ports & Adapters)

Goal: move every module under `src/module/` from the current
`controller → service → repository (Drizzle)` layering to a hexagonal layout:

```text
Controller ──► Facade ──► Service ──► Port (interface) ◄── Repository (TypeORM adapter)
```

- **Service talks to the Port**, never to TypeORM or a concrete repository.
- **Repository implements the Port** (it is the adapter); it is the only code that touches TypeORM.
- **Facade** is the module's single public entry point, used by its own controllers and by other modules.

This work is combined with the Drizzle → TypeORM migration described in `CLAUDE.md`: every
repository has to be rewritten anyway, so each one is rewritten once, directly as a port adapter.

---

## 1. Where the code is today

Findings from reading the codebase (commit `613b40b`):

| Area | Current state | Problem for hexagonal |
| --- | --- | --- |
| Services | Inject concrete classes: `AttendanceService` takes `AttendanceRepository`, `SessionsService`, `HolidaysService`, `AuditService`, `DomainEvents` | Service is bound to a concrete DB class; cannot swap or isolate it |
| Repositories | Drizzle queries via `DatabaseService.tenant(tx => ...)`, return Drizzle row types (`AttendanceRecordRow` from `@database/schema`) | Persistence types leak into services, DTOs and specs |
| Row types | 61 imports of `@database/schema` across services, repositories and specs | Domain is shaped by the ORM, not the other way round |
| Cross-module calls | Services call other modules' services directly (`SessionsService` ×8, `HolidaysService` ×2, `InstitutionsService` ×2, `SmsService`, `PasswordService` ×3) | No stable public API per module; any public method of any exported service is fair game |
| Broken aliases | `@modules/*`, `@database/*`, `@shared/*` are imported but don't exist (real alias is `@module/*`); `@modules/academics/academics.module` doesn't exist (academics is split into `sessions`, `shifts`, `classes`, `subjects`, `teachers`, `holidays`); academics DTOs sit loose in `src/module/dto/` | Must be fixed as part of the move |
| Good precedent | `sms/gateway/sms.gateway.ts` (`SMS_GATEWAY` symbol + `SmsGateway` interface + 3 adapters) and `auth/otp.sender.ts` (`OTP_SENDER` + `OtpSender`) | These are already ports & adapters. The whole codebase follows the same pattern |

---

## 2. Target structure per module

Example for `attendance` (every module follows the same shape; sub-resources such as
`students/enrolments` get the same folders inside their sub-folder):

```text
src/module/attendance/
├── attendance.module.ts                 # wiring only: binds ports to adapters
├── attendance.facade.ts                 # public API of the module (exported)
│
├── domain/                              # pure TypeScript, no Nest, no TypeORM
│   ├── attendance-record.ts             # interface AttendanceRecord, RosterEntry, ...
│   ├── attendance-status.enum.ts        # enum AttendanceStatus
│   └── attendance.constants.ts          # STIPEND_THRESHOLD_PERCENT, DAILY_PERIOD
│
├── application/
│   ├── ports/
│   │   └── attendance.repository.port.ts   # ATTENDANCE_REPOSITORY + interface
│   ├── attendance.service.ts            # business rules; depends on ports only
│   └── attendance.service.spec.ts
│
├── infrastructure/
│   └── persistence/
│       ├── attendance-record.entity.ts  # TypeORM @Entity
│       ├── staff-attendance.entity.ts
│       ├── attendance.mapper.ts         # entity <-> domain
│       └── attendance.repository.ts     # implements AttendanceRepositoryPort
│
├── presentation/
│   ├── attendance.controller.ts         # HTTP only; calls the facade
│   └── dto/                             # request/response DTOs (class-validator, swagger)
│
└── events/
    └── attendance-marked.event.ts
```

### Dependency rule

Arrows point inward only. Nothing in `domain/` or `application/` imports from
`infrastructure/` or `presentation/`.

```text
presentation ──► facade ──► application ──► domain
                                 ▲
infrastructure ──────────────────┘   (implements application/ports)
```

| Layer | May import | Must not import |
| --- | --- | --- |
| `domain/` | nothing outside itself | `@nestjs/*`, `typeorm`, DTOs |
| `application/` | `domain/`, its own `ports/`, other modules' **facades**, `@nestjs/common` (exceptions, `@Inject`) | entities, `typeorm`, `DataSource`, other modules' services/repositories |
| `infrastructure/` | `domain/`, `application/ports/`, `typeorm`, `@nestjs/typeorm` | services, facades, DTOs |
| `presentation/` | the module's facade, its DTOs, auth decorators | services, repositories, entities |
| `*.facade.ts` | its own services, DTOs | repositories, entities |

---

## 3. The four building blocks

### 3.1 Port (`application/ports/*.port.ts`)

An `interface` plus a `Symbol` injection token, same as the existing `SMS_GATEWAY`. Per `CLAUDE.md`
a type is never a class, so no abstract classes. Methods speak **domain types**, never entities.

```ts
// application/ports/attendance.repository.port.ts
import type {
  AttendanceRecord,
  NewAttendanceRecord,
  NewStaffAttendance,
  RosterEntry,
  StaffStatusEntry,
} from '../../domain/attendance-record';

export const ATTENDANCE_REPOSITORY = Symbol('ATTENDANCE_REPOSITORY');

export interface AttendanceRepositoryPort {
  findAssignedSectionIds(userId: string, sessionId: string): Promise<Set<string>>;
  findSheet(sectionId: string, sessionId: string, date: string, period: number): Promise<RosterEntry[]>;
  findStudentsOnApprovedLeave(sectionId: string, sessionId: string, date: string): Promise<Set<string>>;
  findExisting(enrolmentIds: string[], date: string, period: number): Promise<AttendanceRecord[]>;
  findMonth(sectionId: string, sessionId: string, from: string, to: string): Promise<AttendanceRecord[]>;
  upsertMany(rows: NewAttendanceRecord[], actorId: string): Promise<AttendanceRecord[]>;
  upsertStaffMany(rows: NewStaffAttendance[]): Promise<number>;
  findStaffSheet(date: string): Promise<StaffStatusEntry[]>;
}
```

Other outbound ports follow the same pattern: `SMS_GATEWAY` (exists), `OTP_SENDER` (exists),
`AUDIT_LOG`, `EVENT_PUBLISHER`, `SPREADSHEET_READER` (students import), `CLOCK` (wraps `todayLocal()`
so date rules are testable).

### 3.2 Repository (`infrastructure/persistence/*.repository.ts`) — the adapter

Implements the port with TypeORM. The only file that touches entities and `Repository<T>`.
Maps entities to domain objects before returning, so entities never leave this folder.

```ts
// infrastructure/persistence/attendance.repository.ts
@Injectable()
export class AttendanceRepository implements AttendanceRepositoryPort {
  constructor(
    @InjectRepository(AttendanceRecordEntity)
    private readonly records: Repository<AttendanceRecordEntity>,
    private readonly tenant: TenantContext, // opens the RLS transaction (app.institution_id)
  ) {}

  async findMonth(sectionId: string, sessionId: string, from: string, to: string): Promise<AttendanceRecord[]> {
    const rows = await this.tenant.run((manager) =>
      manager.getRepository(AttendanceRecordEntity).find({
        where: { sectionId, sessionId, date: Between(from, to) },
      }),
    );
    return rows.map(AttendanceMapper.toDomain);
  }
  // ...the other port methods
}
```

### 3.3 Service (`application/*.service.ts`) — talks to the port

Holds the business rules (same-day marking, backdating, holidays, leave overrides). Injects
**ports by token** and **other modules' facades**. No TypeORM, no entities.

```ts
@Injectable()
export class AttendanceService {
  constructor(
    @Inject(ATTENDANCE_REPOSITORY) private readonly repo: AttendanceRepositoryPort,
    @Inject(AUDIT_LOG) private readonly audit: AuditLogPort,
    @Inject(EVENT_PUBLISHER) private readonly events: EventPublisherPort,
    private readonly academics: AcademicsFacade, // replaces SessionsService + HolidaysService
  ) {}

  async mark(sectionId: string, cmd: MarkAttendanceCommand, actor: AuthUser): Promise<MarkResult> {
    // rules unchanged; only the dependencies changed
  }
}
```

Note: the service keeps throwing Nest HTTP exceptions (`BadRequestException`, `ForbiddenException`),
as `CLAUDE.md` requires today. Moving to domain errors mapped in `AllExceptionsFilter` is a possible
later step, not part of this refactor.

### 3.4 Facade (`<module>.facade.ts`) — the module's front door

A thin `@Injectable()` that exposes only what outsiders may use. It is the **only** provider a module
`exports`. Controllers call it, other modules call it, and it delegates to services.

```ts
@Injectable()
export class AttendanceFacade {
  constructor(private readonly attendance: AttendanceService) {}

  sheet(sectionId: string, query: AttendanceSheetQuery, actor: AuthUser): Promise<AttendanceSheetDto> {
    return this.attendance.sheet(sectionId, query.date, query.period, actor, query.sessionId);
  }
  mark(sectionId: string, dto: MarkAttendanceDto, actor: AuthUser): Promise<MarkResultDto> { /* ... */ }
  // register, summary, staffSheet, markStaff
}
```

For modules with several services (`students`: students, enrolments, guardians, import;
`sms`: batches, templates, balance, audience, delivery) the facade is where those are combined into one
API, e.g. `SmsFacade.draftForSystem()` (wraps `BatchesService`) and `SmsFacade.sendTransactional()`
(wraps `SmsService.send`, OTP only).

### 3.5 Module wiring

```ts
@Module({
  imports: [TypeOrmModule.forFeature([AttendanceRecordEntity, StaffAttendanceEntity]), AcademicsModule],
  controllers: [AttendanceController],
  providers: [
    AttendanceFacade,
    AttendanceService,
    { provide: ATTENDANCE_REPOSITORY, useClass: AttendanceRepository },
  ],
  exports: [AttendanceFacade],
})
export class AttendanceModule {}
```

---

## 4. Shared kernel (do first)

The code imports `@shared/*` and `@database/*`, which don't exist. Create them as ports + adapters:

| Today (missing) | New home | Shape |
| --- | --- | --- |
| `@shared/audit/audit.service` | `src/module/audit/` | `AUDIT_LOG` port + TypeORM adapter + `AuditFacade` (append-only table) |
| `@shared/events/domain-events.service`, `domain-event` | `src/module/events/` | `DomainEvent` base, `EVENT_PUBLISHER` port, adapter over `EventEmitter2` |
| `@shared/time/local-date` | `src/module/time/` | `CLOCK` port (`today(): string` in Asia/Dhaka) + `monthBounds` helper |
| `@database/database.service`, `tenant-context` | `src/common/services/database/tenant-context.ts` (exists, finish it) | `TenantContext.run(fn)`: opens a transaction and sets `app.institution_id` for RLS |
| `@database/database.errors` | `src/common/services/database/database-errors.ts` | `isUniqueViolation(err)` for Postgres `23505` (no domain knowledge, so `common/` is fine) |
| `@database/schema` | removed | each module owns its entities and domain types |
| `@modules/auth/auth-user`, `roles`, decorators | stays in `auth/`, imported as `@module/auth/...` | domain types used everywhere |

Audit, events and time are domain-aware, so they live under `module/`, not `common/` (rule from `CLAUDE.md`).

---

## 5. Module-by-module migration order

Leaf modules first, so each step only depends on modules already converted.

| # | Module(s) | Ports to create | Facade exposes | Notes |
| --- | --- | --- | --- | --- |
| 0 | shared kernel (§4) | `AUDIT_LOG`, `EVENT_PUBLISHER`, `CLOCK` | `AuditFacade` | Fix `@modules`→`@module` alias everywhere |
| 1 | `sessions`, `shifts`, `classes`, `subjects`, `teachers`, `holidays` | one repository port each | one `AcademicsFacade` (`resolveSessionId`, `isHoliday`, `assertSectionExists`, ...) | Create the missing `academics.module.ts` that imports the six and exports only `AcademicsFacade`. Move `src/module/dto/*` into the owning sub-module's `presentation/dto/` |
| 2 | `institutions` | `INSTITUTIONS_REPOSITORY` | `InstitutionsFacade` | Used by `sms` and setup |
| 3 | `users` | `USERS_REPOSITORY` | `UsersFacade` | |
| 4 | `auth` | `AUTH_REPOSITORY`, `PASSWORD_HASHER`, `TOKEN_SIGNER` (wraps `JwtService`), `OTP_SENDER` (exists) | `AuthFacade` (for `PasswordService` users) | `SmsOtpSender` becomes an adapter calling `SmsFacade.sendTransactional()` |
| 5 | `students` (+ `enrolments`, `guardians`, `import`) | 4 repository ports, `SPREADSHEET_READER` (wraps `exceljs`) | `StudentsFacade` | Import service sees typed rows only (already a rule) |
| 6 | `leave` | `LEAVE_REPOSITORY` | `LeaveFacade` (`studentsOnApprovedLeave`) | Attendance then asks leave via the facade instead of joining `leave_applications` itself |
| 7 | `attendance` | `ATTENDANCE_REPOSITORY` | `AttendanceFacade` | Reference implementation in §3 |
| 8 | `consent` | `CONSENT_REPOSITORY` | `ConsentFacade` | Used by sms audience |
| 9 | `sms` | 5 repository ports, `SMS_GATEWAY` (exists) | `SmsFacade` (`draftForSystem`, `sendTransactional`) | `AbsenceSmsListener` is an inbound adapter: `@OnEvent` → `SmsFacade`. Keep its own try/catch |
| 10 | `health` | none | none | Controller only; leave as is |

Per module checklist:

1. Create `domain/` interfaces and enums from the Drizzle `*.schema.ts` + row types.
2. Write the port interface and `Symbol` token in `application/ports/`.
3. Write the TypeORM entity, mapper and repository adapter in `infrastructure/persistence/`; delete the Drizzle `*.schema.ts` and old repository.
4. Change the service to inject the port by token and other modules' facades; remove `@database/*` imports.
5. Add the facade; point controllers at the facade; move controllers + DTOs to `presentation/`.
6. Module: `TypeOrmModule.forFeature([...])`, `{ provide: TOKEN, useClass: Adapter }`, `exports: [Facade]` only.
7. Update unit and e2e specs (§6). Run `yarn lint`, `yarn test`, and `yarn typecheck` filtered to the module.
8. Add the TypeORM migration for the module's tables (RLS policy + composite FKs `(institution_id, fk)`).

---

## 6. Tests

The existing helpers already support tokens (`getMock(moduleRef, token: Type | symbol | string)`),
so no helper changes are needed.

Unit (service spec) — mock the port, not the class:

```ts
const moduleRef = await Test.createTestingModule({ providers: [AttendanceService] })
  .useMocker(createMock)
  .compile();
const repo = getMock<AttendanceRepositoryPort>(moduleRef, ATTENDANCE_REPOSITORY);
repo.findSheet.mockResolvedValue(roster); // roster: RosterEntry[] (domain type, not a Drizzle row)
```

New unit specs:

- `attendance.facade.spec.ts`: delegates to the service with the right arguments.
- `attendance.mapper.spec.ts`: entity ↔ domain round trip, internal columns dropped.

E2E — override by token instead of class:

```ts
.overrideProvider(ATTENDANCE_REPOSITORY).useValue(createMock<AttendanceRepositoryPort>())
```

Fixtures switch from `AttendanceRecordRow` (Drizzle) to `AttendanceRecord` (domain), still full typed
objects, never `as never`.

---

## 7. Rules to add to `CLAUDE.md` once the first module lands

Replace the current "Layer contract per module" bullet with:

- Layer contract per module: controller (HTTP only) → facade (module's public API, the only export) →
  service (rules, events, HTTP exceptions; depends on ports only) → port (`interface` + `Symbol` token in
  `application/ports/`) ← repository adapter (`infrastructure/persistence/`, the only place that talks to
  TypeORM; returns domain types via a mapper).
- Controllers never call services or repositories; other modules only import a module's facade.
- Entities never leave `infrastructure/`. Domain types live in `domain/` and contain no framework imports.

Optional enforcement: an ESLint `no-restricted-imports` rule blocking `typeorm` and `**/infrastructure/**`
from `**/application/**` and `**/domain/**`, and blocking `**/*.service` / `**/*.repository` imports
across module folders.

---

## 8. Risks and how to handle them

| Risk | Mitigation |
| --- | --- |
| Big-bang breakage (typecheck already fails on missing aliases) | One module per PR in the §5 order; the app compiles at the end of each PR |
| Facades becoming pass-through boilerplate | Facades expose only what controllers/other modules use; small modules can have the facade delegate directly with no extra logic |
| Losing RLS while rewriting queries | Every adapter goes through `TenantContext.run()`; add one e2e/integration test per module that checks a second tenant's rows are invisible |
| Performance regressions (Drizzle had hand-tuned single-query joins, e.g. `findSheet`) | Keep those as `QueryBuilder` queries inside the adapter; the port signature does not change |
| Circular imports between facades (sms ↔ auth, attendance ↔ leave) | Cross-module side effects go through domain events (as `AttendanceMarkedEvent` → absence SMS already does); facades are for queries and direct commands only |
