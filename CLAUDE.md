# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

NestJS 11 API for Ontek EduSmart, a multi-tenant school-management SaaS. Feature specs live in
[docs/features/](docs/features/README.md); each spec maps to one folder under `src/module/`.
The database layer is **TypeORM on PostgreSQL** (`@nestjs/typeorm`, `typeorm`, `pg`) and only TypeORM:
the Drizzle prototype is gone, and no `drizzle-orm` code may come back.

Every module follows the hexagonal (ports & adapters) layout described below. The plan and the
reasons behind it are in [refactor.md](refactor.md).

## Code layout

```text
src/
├── main.ts / app.module.ts / app.setup.ts   # setupApp(): /api prefix + response envelope
├── common/      # cross-cutting, no domain knowledge: filters, interceptors, types, dto, services, utils
│   └── services/database/   # DatabaseService (tenant/system transactions), tenant context, naming strategy
├── config/      # one folder per concern: app, auth, database, http, sms
├── database/    # data-source.ts (TypeORM CLI), migrations/, bootstrap.sql, seed.ts
└── module/
    ├── audit/ events/ time/        # shared kernel: AuditLogPort, EventPublisherPort, ClockPort (@Global)
    ├── academics/                  # sessions, shifts, classes+sections, subjects, teachers, holidays
    ├── auth/ users/ institutions/ students/ leave/ attendance/ consent/ sms/ health/
test/            # e2e specs, setup-env.ts, tsconfig.jest.json, utils/ (create-mock, matchers, pg-error, fake-data-source)
```

### Module layout

A module with several resources (academics, students, sms) keeps one set of folders and names files
per resource (`services/sessions.service.ts`, `application/ports/sessions.repository.port.ts`, ...).

```text
src/module/<name>/
├── <name>.module.ts                  # imports its persistence module; provides services, facades, adapters; exports facades only
├── application/ports/                # abstract classes: XRepository (x.repository.port.ts) and other ports (ClockPort, SmsGatewayPort…)
├── controllers/                      # HTTP only; call facades
├── domain/                           # interfaces, enums, constants and pure functions; no Nest, no TypeORM
├── dto/                              # every DTO of the module: request, query, response, import rows
├── services/                         # *.service.ts (rules) and *.facade.ts (public API)
├── infrastructure/
│   ├── persistence/relational/
│   │   ├── entities/                 # @Entity classes (no domain types)
│   │   ├── mappers/                  # XMapper.toDomain(entity) / XMapper.toPersistence(newX)
│   │   ├── repositories/             # XRelationalRepository implements XRepository; ALL repository files live here
│   │   └── relational-persistence.module.ts  # forFeature(entities) + { provide: XRepository, useClass: XRelationalRepository }, exports the ports
│   └── adapters/                     # non-database adapters (SMS gateways, password hasher, JWT, Excel, clock)
├── listeners/                        # inbound event adapters (@OnEvent)
├── middleware/                       # inbound HTTP adapters (auth only)
└── events/                           # DomainEvent subclasses this module publishes
```

Rules that keep it clean:

- Path aliases (tsconfig `paths`): `@common/*`, `@config/*`, `@module/*`, `@test/*`. Mirror any new alias in
  both Jest configs. Nest CLI rewrites them to relative requires in `dist/`.
- Layer contract: controller (HTTP only) → facade (`services/*.facade.ts`, the module's public API) →
  service (`services/*.service.ts`: rules, events, HTTP exceptions) → port (`application/ports/*.port.ts`) ←
  adapter (`infrastructure/persistence/relational/repositories/*` or `infrastructure/adapters/*`). Controllers
  call facades, never services or repositories.
- Ports are `abstract class`es with only `abstract` members. Repository ports are named `XRepository`
  (file `x.repository.port.ts`); their TypeORM adapters `XRelationalRepository`. Nest uses the class itself as
  the DI token, so services inject `private readonly repo: XRepository` with no `@Inject()`. Repository
  bindings live in the module's `relational-persistence.module.ts`
  (`{ provide: XRepository, useClass: XRelationalRepository }`, exporting the ports); other adapters are bound
  in `<name>.module.ts`. Adapters `implements` (never `extends`) the port.
- Inside a module, a service may use sibling services and sibling ports. Across modules, only facades:
  a module `exports` its facades and nothing else (the shared kernel exports its ports). Never import
  another module's service, port or repository.
- Repository adapters are the only code that touches TypeORM. They go through `DatabaseService`
  (`db.tenant(m => ...)` or `db.system(m => ...)`), not `@InjectRepository`. They write only their own
  module's tables. Reading another module's table is allowed only where a facade call would create a module
  cycle or an N+1, and the file says so: `auth.repository` (users, institutions before login),
  `teachers.repository` (user roles), `sms/audience.repository` (one recipient query). Do not add more
  without the same justification.
- Entities never leave `infrastructure/`: repositories convert every row with its mapper
  (`XMapper.toDomain(entity)` on the way out, `XMapper.toPersistence(newX)` on insert). Entities do not
  implement domain types. Response DTOs map domain objects explicitly so internal columns never leak.
- Every response goes through `ResponseEnvelopeInterceptor` (`{ success, data, error, meta? }`). Return a
  `Paginated<T>` from services (`paginate(items, total, query)` from `@common/types/paginated`) to get
  `meta` lifted automatically.
- Every error goes through `AllExceptionsFilter`, which also uses the envelope; codes come from the
  `HttpStatus` enum name (`NOT_FOUND`, `CONFLICT`) or `VALIDATION_ERROR` (with `details`).
- Guards are global (`ThrottlerGuard`, `AuthGuard`, `RolesGuard`, in that order). `JwtAuthMiddleware`
  (auth module, every route) verifies the bearer token through `AuthFacade`, sets `req.user` and opens the
  tenant context; a bad token leaves the request anonymous, so `AuthGuard` answers 401. Use `@Public()` for
  open routes and `@Roles([...])` for role gates, both from `@common/decorators` (the guards live in
  `@common/guards`). Resource-level checks (own section, own child) go in services. Roles are the `Role`
  enum in `@common/types/role`;
  validate request DTOs with `@IsEnum(Role, { each: true })`.
- Review conventions (apply everywhere): closed sets of named values (roles, statuses, kinds, purposes)
  are TypeScript `enum`s owned by their module's `domain/`; `as const` objects are only for data tables
  (templates, merge-field labels, import columns). `any` is banned (`strict: true`, eslint
  `no-explicit-any: error`); `unknown` only at true boundaries (caught errors, raw payloads) and narrowed
  immediately. Every object shape that is not a request/response DTO gets a named `interface` (no inline
  `{ a: x }` types in signatures, no `Record<string, ...>` where the keys are known); interfaces are plain
  (no `readonly`); a type is an `interface`/`type`, never a class, except ports, which are abstract classes
  so they can be DI tokens. Helper functions used by one class are `private` methods of that class.
  Nothing domain-specific lives in `common/` (owning module, or the shared kernel when several modules need
  it); the one exception is the auth plumbing every controller uses: `common/guards`, `common/decorators`
  (`@Public`, `@Roles`, `@CurrentUser`) and `common/types` (`Role`, `AuthUser`, `AuthenticatedRequest`). Follow the framework's documented way before inventing a wrapper. Tests use typed fixtures and the
  helpers in `test/utils`, never `as never`, `as object` or `as unknown as`.
- Config: each `src/config/<name>/<name>.config.ts` is a `registerAs` factory that validates its own env
  class through the generic `validateConfig` (`@common/utils/validate/validate-config`, throws
  `InternalServerErrorException` listing every invalid variable, never the values) and is injected as
  `@Inject(xConfig.KEY) x: ConfigType<typeof xConfig>` (module factories use `inject: [xConfig.KEY]`). Import
  `ConfigType` with `import type` when it appears in a decorated signature. Specs provide
  `{ provide: xConfig.KEY, useValue: {...} }`. New env vars go in the namespace that owns them, with the
  returned shape added to that folder's `*.type.ts`. All five namespaces are loaded in `app.module.ts`
  (`ConfigModule.forRoot`, global, cached, `.env.local` then `.env`).
- Database: `TypeOrmConfigService` builds the options from `databaseConfig` (`DATABASE_URL`) with
  `autoLoadEntities: true`, `synchronize: false` and `SnakeNamingStrategy` (so `nameBn` maps to `name_bn`
  with no `name:` on columns). Keep `src/database/data-source.ts` (TypeORM CLI) in step with it. Schema
  changes go through migrations in `src/database/migrations/`, never `synchronize`. Give every column an
  explicit `type` (union types defeat `emitDecoratorMetadata`), give `default` to columns with a DB default
  (so `save()` returns it), and declare checks and partial indexes on the entity too (`@Check`,
  `@Index({ where })`). Composite foreign keys live only in migrations. After changing entities, run
  `yarn typeorm schema:log` against a migrated database: it must list only foreign-key drops.
- Entities: every module owns its `infrastructure/persistence/relational/entities/*.entity.ts` files and
  registers them with `TypeOrmModule.forFeature([...])` in its `relational-persistence.module.ts`.
- DTOs: class-validator on every request DTO. Types used in decorated signatures must be imported with
  `import type` (isolatedModules + emitDecoratorMetadata).
- Tenancy: every tenant table carries `institution_id` and is protected by FORCE row-level security keyed on
  `app_current_institution()`, which reads the per-transaction `app.institution_id` setting.
  `DatabaseService.tenant()` opens a transaction and sets it from the tenant context (it throws outside an
  authenticated request). `DatabaseService.system()` switches to the NOLOGIN `BYPASSRLS` role
  (`DATABASE_SYSTEM_ROLE`, default `edusmart_system`) for pre-auth lookups and provider callbacks only.
  Tenant-scoped references use composite foreign keys `(institution_id, <fk>)` → `(institution_id, id)`
  because Postgres checks foreign keys as the table owner and bypasses RLS. The app connects as a
  non-superuser owner role so FORCE RLS applies (`src/database/bootstrap.sql`). Never connect as a superuser.
- Events: extend `DomainEvent` (`@module/events/domain/domain-event`) in `<module>/events/` and publish
  through `EventPublisherPort`. `@OnEvent` listeners live in `listeners/`, run inside the publishing request
  and must catch their own errors: a failed side effect must not fail the request.
- Audit: anything backdated, overriding or financial goes through `AuditLogPort.record()`. The `audit_log`
  table is append-only (a trigger rejects UPDATE/DELETE).
- Dates: attendance and leave compare ISO date strings; "today" is `ClockPort.today()` (Asia/Dhaka, built on
  `todayLocal()` in `@module/time/domain/local-date`), never `new Date()` on the server clock.
- Keep `@nestjs/config`, `@nestjs/jwt`, `@nestjs/event-emitter`, `@nestjs/axios` on the majors that
  match Nest 11 (4.x, 11.x, 3.x, 4.x). Their 12.x releases are ESM-only and break Jest under CommonJS.
  `@nestjs/typeorm` is on 12.x (the first release that supports `typeorm` 1.x) and is ESM-only too: both Jest
  configs compile it with ts-jest (`test/tsconfig.jest.json`, `transformIgnorePatterns`) and swap its one
  `import.meta` file for `test/utils/typeorm-compat.stub.ts`. The app itself needs Node 22.12+ (require of ESM).
- File uploads use `FileInterceptor` from `@nestjs/platform-express` with a size limit; `Express.Multer.File`
  needs `multer` in tsconfig `types` (the list is explicit, so new ambient type packages must be added there).
- Excel goes through `exceljs` (CJS) behind `SpreadsheetPort`; the only workbook code is
  `students/infrastructure/adapters/exceljs.spreadsheet.ts`. Services see typed rows, never cells.
- Outbound HTTP goes through `HttpService` from a module-local `HttpModule.registerAsync` (timeout
  from `httpConfig`); wrap calls in `firstValueFrom`, map failures to `ServiceUnavailableException`, and
  never log request bodies that may contain codes or personal data.
- SMS: guardian-facing messages go through `BatchesService` (consent, cost preview, ledger, log); other
  modules use `SmsFacade.draftForSystem()` with a `dedupeKey` and let the office send; they never send
  directly (Spec v2 §9: cost before send). `SmsFacade.sendTransactional()` is for OTPs only. Gateways
  implement `SmsGatewayPort`. Money is in paisa integers; the `sms_ledger` table is append-only like the
  audit table. Fan-out uses `mapWithConcurrency` (`@common/utils/concurrency`).

## Commands

Package manager is **yarn** (`yarn.lock` is the only lockfile; there is no `package-lock.json`).
`node_modules/` is not installed by default.

```bash
yarn install
yarn start:dev        # watch mode, http://localhost:<PORT>/api, Swagger at /docs
yarn build            # nest build -> dist/ (deleteOutDir: true, so dist/ is wiped first)
yarn start:prod       # node dist/main
yarn lint             # eslint with --fix baked in — it rewrites files
yarn format           # prettier --write over src/ and test/
yarn test             # unit tests
yarn test:cov         # coverage -> ./coverage
yarn test:e2e         # uses test/jest-e2e.json
yarn typecheck        # tsc --noEmit (covers specs too)

yarn migration:run                                    # apply migrations (DATABASE_URL)
yarn migration:revert                                 # undo the last one
yarn migration:create src/database/migrations/Name    # empty migration to fill in
yarn typeorm schema:log                               # entity ↔ database drift check
SEED_PASSWORD=... yarn db:seed                        # demo institution "demo", head 01700000000
```

Run a single unit test:

```bash
yarn test app.controller                     # positional path pattern
yarn test --testPathPatterns=app.controller  # Jest 30 renamed --testPathPattern (plural now)
yarn test -t "should return"                 # by test name
```

Fresh database: run `src/database/bootstrap.sql` once as a superuser
(`psql -v app_password=... -f src/database/bootstrap.sql`), point `DATABASE_URL` at the `edusmart_app` role,
then `yarn migration:run` and optionally `yarn db:seed`. Environment is loaded from `.env.local` then `.env`
and validated at boot by the `registerAs` factories in [src/config/](src/config/); a missing or invalid
variable aborts startup with one message listing all of them. The API is served under the `/api` prefix.

## Test layout

Two separate Jest configs, and they do not see each other's files:

- **Unit** — config is inline in [package.json](package.json). `rootDir` is `src`, pattern is
  `*.spec.ts`. Unit tests live *beside* the code they test, not in `test/`.
- **E2E** — [test/jest-e2e.json](test/jest-e2e.json). `rootDir` is `test/` (aliases map to
  `<rootDir>/../src`), pattern is `*.e2e-spec.ts`, and `test/setup-env.ts` sets env vars before
  any module import (config validation runs at import time). These boot the real Nest app via
  `Test.createTestingModule` + supertest, override repository ports with mocks and the TypeORM
  `DataSource` with `fakeDataSource()`, so no Postgres is needed.

Testing conventions:

- Every service/controller spec builds its subject with `Test.createTestingModule({ providers: [X] })
  .useMocker(createMock)` from [test/utils/create-mock.ts](test/utils/create-mock.ts) and reads mocks
  back with `getMock(moduleRef, Dep)` (typed `jest.Mocked<Dep>`; ports work as tokens). This exercises
  Nest's injector, so a missing `@Injectable()` or wrong port fails the spec. Direct `new Service()` is only
  for code with no DI at all (pure DTO/helper specs).
- Mock ports and other modules' facades, never adapters. Provide a real adapter only when the spec is about
  it (the import spec uses the real `ExcelJsSpreadsheet`). Mock `ClockPort` (`today`/`now`) wherever a rule
  depends on the date.
- Provide real values only where a constructor reads config at construction time
  (`{ provide: smsConfig.KEY, useValue: {...} }`); everything else is auto-mocked.
- E2E specs: `.overrideProvider(XRepository).useValue(createMock<XRepository>())` and
  `.overrideProvider(DataSource).useValue(fakeDataSource())`.
- Fixtures are full typed domain objects (`const row: LeaveApplication = {...}`), never partial objects cast
  with `as never`. Database errors come from `pgError(UNIQUE_VIOLATION)` in
  [test/utils/pg-error.ts](test/utils/pg-error.ts). Asymmetric matchers go through `anyOf(Date)` /
  `containing<AuditEntry>({...})` from [test/utils/matchers.ts](test/utils/matchers.ts), the one place Jest's
  `any`-typed matchers are adapted.

## Lint and type-checking notes

- ESLint uses `tseslint.configs.recommendedTypeChecked` with `projectService`, so linting is
  type-aware: it needs a successful TS project load, and a file outside `tsconfig.json`'s scope
  will fail to lint rather than being skipped.
- Prettier runs *through* ESLint as an `error`-level rule, so a formatting deviation is a lint
  failure. Prettier config: single quotes, trailing commas everywhere.
- `tsconfig.json` has `strict: true` with only `strictPropertyInitialization` off (request DTOs, env classes
  and entities are populated by the validation pipe, `validateConfig` or TypeORM, not a constructor).
  `noFallthroughCasesInSwitch` is on.
- `module`/`moduleResolution` are `nodenext` with `isolatedModules: true`, but the ESLint config
  declares `sourceType: 'commonjs'` — output is CommonJS. Use standard NestJS-style
  `import`/`export`, not top-level `await` or `.mjs`-only patterns.
- `emitDecoratorMetadata` + `experimentalDecorators` are on, which is what makes Nest's
  constructor-based DI and TypeORM entities work. Don't disable them.

## Repository

Git remote is `arviontech/school-management-saas` on GitHub; default branch is `main`. Work on a
branch and open a PR.
