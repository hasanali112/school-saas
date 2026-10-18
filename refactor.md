# Refactor plan: Hexagonal architecture (Ports & Adapters)

Goal: move every module under `src/module/` from the current
`controller → service → repository (Drizzle)` layering to a hexagonal layout:

```text
Controller ──► Facade ──► Service ──► Port (abstract class) ◄── Repository (TypeORM adapter)
```

- **Service talks to the Port**, never to TypeORM or a concrete repository.
- **Repository implements the Port** (it is the adapter); it is the only code that touches TypeORM.
- **Facade** is the module's single public entry point, used by its own controllers and by other modules.
  It lives in the `service/` folder next to the services it wraps.

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
| DTO placement | DTOs are spread out: `<module>/dto/`, `students/import/import-row.dto.ts`, and academics DTOs sit loose in `src/module/dto/` | No single place to find a module's DTOs |
| Broken aliases | `@modules/*`, `@database/*`, `@shared/*` are imported but don't exist (real alias is `@module/*`); `@modules/academics/academics.module` doesn't exist (academics is split into `sessions`, `shifts`, `classes`, `subjects`, `teachers`, `holidays`) | Must be fixed as part of the move |
| Existing ports | `sms/gateway/sms.gateway.ts` (`SMS_GATEWAY` symbol + `SmsGateway` interface + 3 adapters) and `auth/otp.sender.ts` (`OTP_SENDER` + `OtpSender` interface) | Right idea, wrong shape: convert both to abstract-class ports (§3.1) |

---

## 2. Target structure per module

Example for `attendance`. Every module follows the same shape; a module with sub-resources
(`students/enrolments`, `sms/batches`, ...) repeats the same folders inside each sub-folder.

```text
src/module/attendance/
├── attendance.module.ts                     # wiring only: binds ports to adapters
│
├── controller/
│   └── attendance.controller.ts             # HTTP only; calls the facade
│
├── dto/                                     # ALL DTOs of the module live here
│   ├── mark-attendance.dto.ts               #   request DTOs (class-validator)
│   ├── attendance-sheet-query.dto.ts
│   ├── month-query.dto.ts
│   └── attendance.response.dto.ts           #   response DTOs (swagger, explicit mapping)
│
├── domain/                                  # pure TypeScript, no Nest, no TypeORM
│   ├── attendance-record.ts                 # interface AttendanceRecord, RosterEntry, ...
│   ├── attendance-status.enum.ts            # enum AttendanceStatus
│   └── attendance.constants.ts              # STIPEND_THRESHOLD_PERCENT, DAILY_PERIOD
│
├── port/
│   └── attendance.repository.port.ts        # abstract class AttendanceRepositoryPort
│
├── service/                                 # application layer
│   ├── attendance.facade.ts                 # public API of the module (the only export)
│   ├── attendance.facade.spec.ts
│   ├── attendance.service.ts                # business rules; depends on ports only
│   └── attendance.service.spec.ts
│
├── repository/                              # adapter: the only place that talks to TypeORM
│   ├── entities/
│   │   ├── attendance-record.entity.ts      # TypeORM @Entity
│   │   └── staff-attendance.entity.ts
│   ├── attendance.mapper.ts                 # entity <-> domain
│   └── attendance.repository.ts             # implements AttendanceRepositoryPort
│
└── events/
    └── attendance-marked.event.ts
```

### Dependency rule

Arrows point inward only. Nothing in `domain/`, `port/` or `service/` imports from `repository/`
or `controller/`.

```text
controller ──► service/facade ──► service ──► port ──► domain
                                               ▲
repository ────────────────────────────────────┘   (implements port)
```

| Folder | May import | Must not import |
| --- | --- | --- |
| `domain/` | nothing outside itself | `@nestjs/*`, `typeorm`, DTOs |
| `port/` | `domain/` | `@nestjs/*`, `typeorm`, entities, DTOs |
| `service/` (services) | `domain/`, `port/`, `dto/`, other modules' **facades**, `@nestjs/common` (exceptions, `@Injectable`) | entities, `typeorm`, `DataSource`, `repository/`, other modules' services |
| `service/` (facade) | its own services, `dto/` | `port/`, `repository/`, entities |
| `repository/` | `domain/`, `port/`, `typeorm`, `@nestjs/typeorm` | `service/`, `dto/`, `controller/` |
| `controller/` | `service/*.facade`, `dto/`, auth decorators | services, ports, repositories, entities |
| `dto/` | `domain/` (enums), `class-validator`, `class-transformer`, `@nestjs/swagger` | entities, repositories |

---

## 3. The building blocks

### 3.1 Port (`port/*.port.ts`) — abstract class

A port is an `abstract class` with only `abstract` methods. Nest can inject an abstract class directly,
so the class itself is the DI token: no `Symbol`, no `@Inject(...)`. Methods take and return
**domain types**, never entities.

```ts
// port/attendance.repository.port.ts
import type {
  AttendanceRecord,
  NewAttendanceRecord,
  NewStaffAttendance,
  RosterEntry,
  StaffStatusEntry,
} from '../domain/attendance-record';

export abstract class AttendanceRepositoryPort {
  abstract findAssignedSectionIds(userId: string, sessionId: string): Promise<Set<string>>;
  abstract findSheet(sectionId: string, sessionId: string, date: string, period: number): Promise<RosterEntry[]>;
  abstract findStudentsOnApprovedLeave(sectionId: string, sessionId: string, date: string): Promise<Set<string>>;
  abstract findExisting(enrolmentIds: string[], date: string, period: number): Promise<AttendanceRecord[]>;
  abstract findMonth(sectionId: string, sessionId: string, from: string, to: string): Promise<AttendanceRecord[]>;
  abstract upsertMany(rows: NewAttendanceRecord[], actorId: string): Promise<AttendanceRecord[]>;
  abstract upsertStaffMany(rows: NewStaffAttendance[]): Promise<number>;
  abstract findStaffSheet(date: string): Promise<StaffStatusEntry[]>;
}
```

Rules for ports:

- Only `abstract` members. No constructor, no fields, no implemented methods.
- One port per outbound dependency (DB, gateway, clock, audit, events). Name: `<Thing>Port`.
- The two existing ports are converted the same way:
  - `SMS_GATEWAY` + `interface SmsGateway` → `abstract class SmsGatewayPort` in `sms/port/sms-gateway.port.ts`;
    `smsGatewayProvider` becomes `{ provide: SmsGatewayPort, useFactory: ... }`.
  - `OTP_SENDER` + `interface OtpSender` → `abstract class OtpSenderPort` in `auth/port/otp-sender.port.ts`;
    `{ provide: OtpSenderPort, useClass: SmsOtpSender }`.
- Other outbound ports: `AuditLogPort`, `EventPublisherPort`, `ClockPort` (wraps `todayLocal()` so date
  rules are testable), `SpreadsheetReaderPort` (students import), `PasswordHasherPort`, `TokenSignerPort`.

> This deliberately changes the `CLAUDE.md` rule "a type is an interface/type, never a class" for ports
> only. Domain shapes in `domain/` stay plain `interface`s. See §7 for the updated wording.

### 3.2 Repository (`repository/*.repository.ts`) — the adapter

Implements the port with TypeORM. The only file that touches entities and `Repository<T>`.
Maps entities to domain objects before returning, so entities never leave `repository/`.

```ts
// repository/attendance.repository.ts
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
    return rows.map((row) => this.mapper.toDomain(row));
  }
  // ...the other port methods
}
```

`implements` (not `extends`) is used on purpose: TypeScript checks every abstract method is present, and
the adapter does not inherit anything from the port.

### 3.3 Service (`service/*.service.ts`) — talks to the port

Holds the business rules (same-day marking, backdating, holidays, leave overrides). Injects **ports**
and **other modules' facades** by type. No TypeORM, no entities, no `@Inject(TOKEN)`.

```ts
// service/attendance.service.ts
@Injectable()
export class AttendanceService {
  constructor(
    private readonly repo: AttendanceRepositoryPort,
    private readonly audit: AuditLogPort,
    private readonly events: EventPublisherPort,
    private readonly clock: ClockPort,
    private readonly academics: AcademicsFacade, // replaces SessionsService + HolidaysService
  ) {}

  async mark(sectionId: string, dto: MarkAttendanceDto, actor: AuthUser): Promise<MarkResultDto> {
    // rules unchanged; only the dependencies changed
  }
}
```

The service keeps throwing Nest HTTP exceptions (`BadRequestException`, `ForbiddenException`), as
`CLAUDE.md` requires today. Moving to domain errors mapped in `AllExceptionsFilter` is a possible later
step, not part of this refactor.

### 3.4 Facade (`service/*.facade.ts`) — the module's front door

A thin `@Injectable()` in the `service/` folder. It exposes only what outsiders may use and is the
**only** provider a module `exports`. Controllers call it, other modules call it, and it delegates to the
services beside it.

```ts
// service/attendance.facade.ts
@Injectable()
export class AttendanceFacade {
  constructor(private readonly attendance: AttendanceService) {}

  sheet(sectionId: string, query: AttendanceSheetQueryDto, actor: AuthUser): Promise<AttendanceSheetDto> {
    return this.attendance.sheet(sectionId, query.date, query.period, actor, query.sessionId);
  }
  mark(sectionId: string, dto: MarkAttendanceDto, actor: AuthUser): Promise<MarkResultDto> {
    return this.attendance.mark(sectionId, dto, actor);
  }
  // register, summary, staffSheet, markStaff
}
```

For modules with several services (`students`: students, enrolments, guardians, import;
`sms`: batches, templates, balance, audience, delivery) the facade is where those are combined into one
API, e.g. `SmsFacade.draftForSystem()` (wraps `BatchesService`) and `SmsFacade.sendTransactional()`
(wraps `SmsService.send`, OTP only).

### 3.5 DTOs (`dto/`)

Every DTO of a module lives in its `dto/` folder, nowhere else:

- Request DTOs (`*.dto.ts`): class-validator on every field, used by controllers and passed to the facade.
- Response DTOs (`*.response.dto.ts`): built in the service from domain objects with an explicit mapping,
  so internal columns never leak.
- Query DTOs (`*-query.dto.ts`): pagination, filters, `date` / `month` params.
- Import / spreadsheet row DTOs too (`students/import/import-row.dto.ts` → `students/dto/import-row.dto.ts`).
- Sub-resources keep their own `dto/` (`students/enrolments/dto/`), never a shared one at `src/module/dto/`.
  The loose academics DTOs in `src/module/dto/` move into `sessions/dto/`, `classes/dto/`, `subjects/dto/`, etc.
- Shared, domain-free DTOs (`PaginationQueryDto`) stay in `src/common/dto/`.

### 3.6 Module wiring

```ts
@Module({
  imports: [TypeOrmModule.forFeature([AttendanceRecordEntity, StaffAttendanceEntity]), AcademicsModule],
  controllers: [AttendanceController],
  providers: [
    AttendanceFacade,
    AttendanceService,
    { provide: AttendanceRepositoryPort, useClass: AttendanceRepository },
  ],
  exports: [AttendanceFacade],
})
export class AttendanceModule {}
```

---

## 4. Shared kernel (do first)

The code imports `@shared/*` and `@database/*`, which don't exist. Create them with the same layout:

| Today (missing) | New home | Shape |
| --- | --- | --- |
| `@shared/audit/audit.service` | `src/module/audit/` | `port/audit-log.port.ts` (abstract class) + `repository/` adapter + `service/audit.facade.ts` (append-only table) |
| `@shared/events/domain-events.service`, `domain-event` | `src/module/events/` | `DomainEvent` base, `port/event-publisher.port.ts` + adapter over `EventEmitter2` |
| `@shared/time/local-date` | `src/module/time/` | `port/clock.port.ts` (`abstract today(): string`, Asia/Dhaka) + `monthBounds` helper |
| `@database/database.service`, `tenant-context` | `src/common/services/database/tenant-context.ts` (exists, finish it) | `TenantContext.run(fn)`: opens a transaction and sets `app.institution_id` for RLS |
| `@database/database.errors` | `src/common/services/database/database-errors.ts` | `isUniqueViolation(err)` for Postgres `23505` (no domain knowledge, so `common/` is fine) |
| `@database/schema` | removed | each module owns its entities (`repository/entities/`) and domain types (`domain/`) |
| `@modules/auth/auth-user`, `roles`, decorators | stays in `auth/`, imported as `@module/auth/...` | domain types used everywhere |

Audit, events and time are domain-aware, so they live under `module/`, not `common/` (rule from `CLAUDE.md`).
Each of these modules is `@Global()` and exports its port binding, so feature modules can inject
`AuditLogPort`, `EventPublisherPort` and `ClockPort` without importing them one by one.

---

## 5. Module-by-module migration order

Leaf modules first, so each step only depends on modules already converted.

| # | Module(s) | Ports to create | Facade exposes | Notes |
| --- | --- | --- | --- | --- |
| 0 | shared kernel (§4) | `AuditLogPort`, `EventPublisherPort`, `ClockPort` | `AuditFacade` | Fix `@modules`→`@module` alias everywhere |
| 1 | `sessions`, `shifts`, `classes`, `subjects`, `teachers`, `holidays` | one repository port each | one `AcademicsFacade` (`resolveSessionId`, `isHoliday`, `assertSectionExists`, ...) | Create the missing `academics.module.ts` that imports the six and exports only `AcademicsFacade`. Move `src/module/dto/*` into each sub-module's `dto/` |
| 2 | `institutions` | `InstitutionsRepositoryPort` | `InstitutionsFacade` | Used by `sms` and setup |
| 3 | `users` | `UsersRepositoryPort` | `UsersFacade` | |
| 4 | `auth` | `AuthRepositoryPort`, `PasswordHasherPort`, `TokenSignerPort` (wraps `JwtService`), `OtpSenderPort` (convert existing) | `AuthFacade` (for `PasswordService` users) | `SmsOtpSender` becomes an adapter calling `SmsFacade.sendTransactional()` |
| 5 | `students` (+ `enrolments`, `guardians`, `import`) | 4 repository ports, `SpreadsheetReaderPort` (wraps `exceljs`) | `StudentsFacade` | Import service sees typed rows only (already a rule); `import-row.dto.ts` moves to `dto/` |
| 6 | `leave` | `LeaveRepositoryPort` | `LeaveFacade` (`studentsOnApprovedLeave`) | Attendance then asks leave via the facade instead of joining `leave_applications` itself |
| 7 | `attendance` | `AttendanceRepositoryPort` | `AttendanceFacade` | Reference implementation in §3 |
| 8 | `consent` | `ConsentRepositoryPort` | `ConsentFacade` | Used by sms audience |
| 9 | `sms` | 5 repository ports, `SmsGatewayPort` (convert existing) | `SmsFacade` (`draftForSystem`, `sendTransactional`) | `AbsenceSmsListener` is an inbound adapter: `@OnEvent` → `SmsFacade`. Keep its own try/catch |
| 10 | `health` | none | none | Controller only; leave as is |

Per module checklist:

1. Create `domain/` interfaces and enums from the Drizzle `*.schema.ts` + row types.
2. Write the port as an `abstract class` in `port/`.
3. Write the TypeORM entities in `repository/entities/`, the mapper and the repository adapter in
   `repository/`; delete the Drizzle `*.schema.ts` and old repository.
4. Move the service into `service/`; inject the port and other modules' facades by type; remove
   `@database/*` imports.
5. Add the facade in `service/`; point the controller at the facade; move the controller to `controller/`.
6. Move every DTO of the module (and its sub-resources) into the matching `dto/` folder.
7. Module: `TypeOrmModule.forFeature([...])`, `{ provide: XRepositoryPort, useClass: XRepository }`,
   `exports: [XFacade]` only.
8. Update unit and e2e specs (§6). Run `yarn lint`, `yarn test`, and `yarn typecheck` filtered to the module.
9. Add the TypeORM migration for the module's tables (RLS policy + composite FKs `(institution_id, fk)`).

---

## 6. Tests

Because the port is an abstract class, it is the token for mocks and overrides too.

One helper change: `getMock` in `test/utils/create-mock.ts` takes `Type<T> | symbol | string`, and an
abstract class is not a `Type<T>`. Widen it to Nest's `Abstract<T>`:

```ts
import type { Abstract, Type } from '@nestjs/common';

export function getMock<T>(
  moduleRef: TestingModule,
  token: Type<T> | Abstract<T> | symbol | string,
): jest.Mocked<T> {
  return moduleRef.get<T, jest.Mocked<T>>(token);
}
```

Unit (service spec) — mock the port:

```ts
const moduleRef = await Test.createTestingModule({ providers: [AttendanceService] })
  .useMocker(createMock)
  .compile();
const repo = getMock(moduleRef, AttendanceRepositoryPort);
repo.findSheet.mockResolvedValue(roster); // roster: RosterEntry[] (domain type, not a Drizzle row)
```

New unit specs:

- `service/attendance.facade.spec.ts`: delegates to the service with the right arguments.
- `repository/attendance.mapper.spec.ts`: entity ↔ domain round trip, internal columns dropped.

E2E — override the port:

```ts
.overrideProvider(AttendanceRepositoryPort).useValue(createMock<AttendanceRepositoryPort>())
```

Fixtures switch from `AttendanceRecordRow` (Drizzle) to `AttendanceRecord` (domain), still full typed
objects, never `as never`.

---

## 7. Rules to add to `CLAUDE.md` once the first module lands

Replace the current "Layer contract per module" bullet with:

- Module layout: `controller/`, `dto/`, `domain/`, `port/`, `service/`, `repository/`, `events/`.
- Layer contract: controller (HTTP only) → facade (`service/*.facade.ts`, the module's public API and its
  only export) → service (`service/*.service.ts`; rules, events, HTTP exceptions; depends on ports only) →
  port (`port/*.port.ts`, an `abstract class` with only abstract methods, used as the DI token) ←
  repository adapter (`repository/`, `implements` the port, the only place that talks to TypeORM, returns
  domain types via a mapper).
- Controllers never call services or repositories; other modules only import a module's facade.
- Every DTO of a module lives in that module's `dto/` folder.
- Entities never leave `repository/`. Domain types live in `domain/` and contain no framework imports.

And amend the review convention "a type is an `interface`/`type`, never a class" to:
"...never a class, except ports, which are `abstract class`es so they can be Nest DI tokens."

Optional enforcement: an ESLint `no-restricted-imports` rule blocking `typeorm` and `**/repository/**`
from `**/service/**`, `**/port/**` and `**/domain/**`, and blocking `**/*.service` / `**/*.repository`
imports across module folders.

---

## 8. Risks and how to handle them

| Risk | Mitigation |
| --- | --- |
| Big-bang breakage (typecheck already fails on missing aliases) | One module per PR in the §5 order; the app compiles at the end of each PR |
| Facades becoming pass-through boilerplate | Facades expose only what controllers/other modules use; small modules can have the facade delegate directly with no extra logic |
| Someone adds logic to a port class | Ports have only `abstract` members; enforce in review (and optionally with a lint rule) |
| Losing RLS while rewriting queries | Every adapter goes through `TenantContext.run()`; add one e2e/integration test per module that checks a second tenant's rows are invisible |
| Performance regressions (Drizzle had hand-tuned single-query joins, e.g. `findSheet`) | Keep those as `QueryBuilder` queries inside the adapter; the port signature does not change |
| Circular imports between facades (sms ↔ auth, attendance ↔ leave) | Cross-module side effects go through domain events (as `AttendanceMarkedEvent` → absence SMS already does); facades are for queries and direct commands only |
