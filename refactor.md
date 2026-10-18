# Refactor: Hexagonal architecture (Ports & Adapters) on TypeORM

**Status: done** on branch `refactor/hexagonal-typeorm`. Every module under `src/module/` uses the layout
below, the Drizzle prototype is gone (`drizzle-orm` removed from `package.json` and `yarn.lock`), and the
schema is a TypeORM migration. The rules are now in [CLAUDE.md](CLAUDE.md); this file records what was
changed and why.

```text
Controller ──► Facade ──► Service ──► Port (abstract class) ◄── Repository / Adapter
```

- **Service talks to the Port**, never to TypeORM or a concrete repository.
- **Repository implements the Port** (it is the adapter); it is the only code that touches TypeORM.
- **Facade** is the connector between a module's controllers and its services; nothing outside the module
  uses it. It lives
  in `service/` next to the services it wraps.
- **DTOs** of a module all live in its `dto/` folder.

---

## 1. What the code looked like before

| Area | Before | After |
| --- | --- | --- |
| Persistence | Drizzle `*.schema.ts` + repositories calling `DatabaseService.tenant(tx => ...)` | TypeORM entities in `repository/entities/`, repositories implementing ports, one initial migration |
| Types | `AttendanceRecordRow` etc. from `@database/schema` everywhere (61 imports) | Domain interfaces and enums in each module's `domain/`; entities `implements` them |
| Dependencies | Services injected concrete repositories and other modules' services | Services inject ports (abstract classes) and other modules' exported services |
| Missing code | `@modules/*`, `@shared/*`, `@database/*`, `academics.module`, `app.setup.ts`, the JWT middleware and the database service were imported but did not exist | Rebuilt: shared kernel modules, `AcademicsModule`, `setupApp`, `JwtAuthMiddleware`, `DatabaseService` |
| Existing ports | `SMS_GATEWAY` / `OTP_SENDER` symbols + interfaces | `SmsGatewayPort` / `OtpSenderPort` abstract classes |

Bugs found and fixed on the way:

- `AllExceptionsFilter` did not produce the `{ success, data, error }` envelope or the `VALIDATION_ERROR` code the e2e specs expect.
- `main.ts` referenced undefined variables and used the `api/v1` prefix while every spec calls `/api`.
- `ThrottlerGuard` was registered without `ThrottlerModule`, so the app could not start.
- `paginate()` was called with a different signature than it was defined with.
- `InstitutionsService.updateCurrent` had unreachable EIIN-conflict handling.
- Nothing ever verified the bearer token or opened the tenant context, so every protected route was 401.
- `PORT` was missing from the e2e environment.

## 2. Module layout (as built)

Every module, including the shared kernel, has the same tree. A module with several resources (academics,
students, sms) names files per resource instead of nesting sub-modules.

```text
src/module/attendance/
├── attendance.module.ts                       # imports the persistence module; services, facades; exports AttendanceService
├── application/ports/
│   └── attendance.repository.port.ts          # abstract class AttendanceRepository
├── controllers/attendance.controller.ts       # HTTP only; calls the facade
├── domain/attendance.ts                       # enum AttendanceStatus, interfaces, constants
├── dto/                                       # request, query and response DTOs
├── services/
│   ├── attendance.facade.ts
│   ├── attendance.service.ts
│   └── attendance.service.spec.ts
├── infrastructure/persistence/relational/
│   ├── entities/attendance-record.entity.ts, staff-attendance.entity.ts
│   ├── mappers/attendance-record.mapper.ts, staff-attendance.mapper.ts
│   ├── repositories/attendance.repository.ts  # AttendanceRelationalRepository implements AttendanceRepository
│   └── relational-persistence.module.ts       # RelationalAttendancePersistenceModule
└── events/attendance-marked.event.ts
```

`relational-persistence.module.ts` is the only place a repository port is bound:

```ts
@Module({
  imports: [TypeOrmModule.forFeature([AttendanceRecordEntity, StaffAttendanceEntity])],
  providers: [{ provide: AttendanceRepository, useClass: AttendanceRelationalRepository }],
  exports: [AttendanceRepository],
})
export class RelationalAttendancePersistenceModule {}
```

Decisions made while building it:

- **Non-database adapters go in `infrastructure/adapters/`** (SMS gateways, scrypt hasher, JWT signer, SMS OTP
  sender, ExcelJS spreadsheet, system clock, event emitter). Inbound adapters other than controllers get
  their own folder: `listeners/` (absence SMS) and `middleware/` (JWT auth).
- **Academics is one module** at `src/module/academics/` with six resources (sessions, shifts, classes,
  subjects, teachers, holidays), each with its own service, facade, port and repository. The loose
  `src/module/dto/` folder became `academics/dto/`.
- **Mappers separate entities from the domain.** Entities do not implement domain types; every repository
  converts rows with `XMapper.toDomain()` and builds inserts with `XMapper.toPersistence()`.
- **Repositories use `DatabaseService`, not `@InjectRepository`**, because every query has to run inside
  the RLS transaction it opens (`tenant()` / `system()`).

## 3. The building blocks

### Port — `application/ports/*.port.ts`

```ts
export abstract class AttendanceRepository {
  abstract findRecords(enrolmentIds: readonly string[], date: string, period: number): Promise<AttendanceRecord[]>;
  abstract upsertMany(rows: readonly NewAttendanceRecord[], actorId: string): Promise<AttendanceRecord[]>;
  // ...
}
```

Only abstract members; the class is the DI token. Repository ports are named `XRepository` and their
TypeORM adapters `XRelationalRepository`. Every port in the codebase:

| Module | Ports |
| --- | --- |
| shared kernel | `AuditLogPort`, `EventPublisherPort`, `ClockPort` |
| academics | `SessionsRepository`, `ShiftsRepository`, `ClassesRepository`, `SubjectsRepository`, `TeachersRepository`, `HolidaysRepository` |
| auth | `AuthRepository`, `PasswordHasherPort`, `TokenSignerPort`, `OtpSenderPort` |
| users / institutions / leave / attendance / consent | one repository port each |
| students | `StudentsRepository`, `EnrolmentsRepository`, `GuardiansRepository`, `ImportRepository`, `SpreadsheetPort` |
| sms | `SmsGatewayPort`, `TemplatesRepository`, `BatchesRepository`, `BalanceRepository`, `AudienceRepository`, `DeliveryReportsRepository` |

### Repository — `infrastructure/persistence/relational/repositories/*.repository.ts`

```ts
@Injectable()
export class AttendanceRelationalRepository implements AttendanceRepository {
  constructor(private readonly db: DatabaseService) {}

  async findMonth(sectionId: string, sessionId: string, from: string, to: string): Promise<AttendanceRecord[]> {
    const rows = await this.db.tenant((m) =>
      m.findBy(AttendanceRecordEntity, { sectionId, sessionId, date: Between(from, to) }),
    );
    return rows.map((row) => AttendanceRecordMapper.toDomain(row));
  }
}
```

### Service — `services/*.service.ts`

```ts
@Injectable()
export class AttendanceService {
  constructor(
    private readonly repo: AttendanceRepository,
    private readonly sessions: SessionsService,
    private readonly holidays: HolidaysService,
    private readonly teachers: TeachersService,     // "assigned sections only"
    private readonly enrolments: EnrolmentsService, // the roster
    private readonly leave: LeaveService,           // approved leave wins
    private readonly users: UsersService,           // staff sheet
    private readonly audit: AuditLogPort,
    private readonly events: EventPublisherPort,
    private readonly clock: ClockPort,
  ) {}
}
```

Attendance used to join enrolments, students, leave and teacher-assignment tables in its own SQL; it now
asks those modules' services and only touches the attendance tables.

### Facade — `services/*.facade.ts`

Thin delegation from the module's controllers (and, in auth, its middleware) to the services beside it.
It is never exported and never used by another module.

### Module-to-module communication — services

Modules talk service to service. Each module `exports` its services, and a service in another module injects
them directly:

| Module | Exports | Used by |
| --- | --- | --- |
| academics | `SessionsService`, `ShiftsService`, `ClassesService`, `SubjectsService`, `TeachersService`, `HolidaysService` | students (`resolveId`, `sectionRefs`, `offeredInSection`), sms (`resolveId`), attendance (`resolveId`, `isHoliday`, `assignedSectionIds`) |
| students | `StudentsService`, `EnrolmentsService`, `GuardiansService`, `ImportService` | attendance (`EnrolmentsService.rosterEntries`) |
| auth | `AuthService` | users (`hashPassword`) |
| users / leave / institutions | `UsersService`, `LeaveService`, `InstitutionsService` | attendance (`listActiveStaff`, `studentsOnApprovedLeave`), sms (`getCurrent`) |
| sms | `SmsService`, `BatchesService`, ... | auth (`SmsService.send` for OTPs); guardian notices go through `BatchesService.draftForSystem` |
| attendance / consent | `AttendanceService`, `ConsentService` | (nobody yet) |

Module dependency graph (no cycles): academics, institutions, leave, consent → none; sms → academics,
institutions; auth → sms; users → auth; students → academics; attendance → academics, students, leave, users.

### Read-only cross-module queries

Three repositories read another module's tables, each with a comment saying why:

- `auth.repository`: users and institutions, before a tenant is known (system role).
- `teachers.repository`: a user's roles; calling `UsersService` would create a cycle (users → auth → sms → academics).
- `sms/audience.repository`: the recipient list in one query (enrolments, students, sections, classes, guardians, consents, users) instead of one service call per student.

They never write those tables.

## 4. Shared kernel

| Module | Provides |
| --- | --- |
| `module/time` | `ClockPort` (`today()` in Asia/Dhaka, `now()`), `todayLocal`, `monthBounds`, `isMonth` |
| `module/events` | `DomainEvent` base, `EventPublisherPort` over `@nestjs/event-emitter` |
| `module/audit` | `AuditLogPort`, `audit_log` entity (append-only), its own `relational-persistence.module.ts` |
| `common/services/database` | `DatabaseService` (`tenant()` / `system()`), tenant context, `SnakeNamingStrategy`, `isUniqueViolation` / `isForeignKeyViolation` |

All three modules are `@Global()` and export their port.

## 5. Database

- `src/database/migrations/1792300000000-InitialSchema.ts`: every table, enum type, unique key and index the
  Drizzle schema had (plus the missing academics and audit tables), composite tenant foreign keys, check
  constraints, FORCE row-level security on every tenant table, and append-only triggers on `audit_log` and
  `sms_ledger`.
- `src/database/bootstrap.sql`: the owner role the app logs in as (not superuser, not BYPASSRLS) and the
  NOLOGIN BYPASSRLS system role.
- `src/database/seed.ts`: a demo institution and head teacher.
- New scripts: `migration:run`, `migration:revert`, `migration:create`, `typeorm`, `db:seed`.

## 6. Tests

- `getMock` accepts abstract classes (`Abstract<T>`), so ports are mock tokens.
- E2E specs override ports and replace the TypeORM `DataSource` with `fakeDataSource()`.
- `@nestjs/typeorm` 12 is ESM-only; both Jest configs compile it with ts-jest and stub its one
  `import.meta` file (`test/utils/typeorm-compat.stub.ts`).
- New specs: `local-date.spec.ts`, `AuthService.authenticate`, attendance sheet merge and staff sheet, `StudentMapper`.

## 7. How it was verified

- `yarn typecheck`, `yarn lint`, `yarn build`: clean.
- `yarn test`: 26 suites, 146 tests pass. `yarn test:e2e`: 6 suites, 38 tests pass.
- Against a real PostgreSQL 16: the migration runs, reverts and runs again; `yarn typeorm schema:log` reports
  only the composite foreign keys (which entities cannot declare); the built app was driven through every
  module over HTTP (login and OTP, academics setup, students, enrolment, guardians, consent, import, leave,
  attendance including backdating, SMS preview/draft/send/402/ledger/delivery reports).
- Row-level security: a second institution sees none of the first one's rows, and `audit_log` / `sms_ledger`
  reject UPDATE and DELETE.

## 8. Follow-ups

- Optional lint enforcement of the layer rules (`no-restricted-imports`: no `typeorm` in `service/`,
  `port/`, `domain/`; no other module's `service/*.service` or `repository/`).
- Services still throw Nest HTTP exceptions; moving to domain errors mapped in `AllExceptionsFilter` is a
  separate step.
- An integration-test suite against Postgres (the checks in §7 were run by hand) would keep RLS and the
  migration honest in CI.
