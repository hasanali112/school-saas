# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

NestJS 11 API for Ontek EduSmart, a multi-tenant school-management SaaS. Feature specs live in
[docs/features/](docs/features/README.md); each spec maps to one folder under `src/module/`.
The database layer is **TypeORM on PostgreSQL** (`@nestjs/typeorm`, `typeorm`, `pg`).

The project is mid-migration from an earlier Drizzle prototype. What is already on the new footing:
`src/config/` (namespaced, validated), `src/common/utils/validate/` (`validateConfig`),
`src/common/services/database/typeorm.config.service.ts`, and the `TypeOrmModule.forRootAsync` wiring in
`app.module.ts`. What is not yet:

- The feature folders under `src/module/` (`auth`, `users`, `institutions`, `academics` split into `sessions`,
  `shifts`, `classes`, `subjects`, `teachers`, `holidays`, `students`, `attendance`, `leave`, `consent`, `sms`,
  `health`) still contain Drizzle `*.schema.ts` and `*.repository.ts` files. They are to be converted to TypeORM
  entities and repositories one module at a time. Do not add new `drizzle-orm` code.
- `app.module.ts` still imports `@modules/*`, `@database/*` and `@shared/*`; the real alias is `@module/*` and
  the `src/database/` and `src/shared/` folders do not exist yet. `yarn typecheck` fails on those until the
  modules are moved over, so filter its output to the files you touched.
- Tenancy (below) is the intended design and must be re-implemented on TypeORM.

## Code layout

```text
src/
├── main.ts / app.module.ts
├── common/      # cross-cutting, no domain knowledge: filters, interceptors, types, dto, services, utils
│   ├── services/database/   # TypeOrmConfigService
│   └── utils/validate/      # validateConfig (generic env validation)
├── config/      # one folder per concern: app, auth, database, http, sms
└── module/      # one folder per feature spec; a module with sub-resources uses sub-folders
test/            # e2e specs, setup-env.ts, utils/ (create-mock, matchers)
```

Each config folder holds `<name>.config.ts` (env class + `registerAs` factory) and `<name>.type.ts`
(the returned shape as an interface; `app.type.ts` also owns `NodeEnv`).

Rules that keep it clean:

- Path aliases (tsconfig `paths`): `@common/*`, `@config/*`, `@module/*`, `@test/*`. Mirror any new alias in
  both Jest configs. Nest CLI rewrites them to relative requires in `dist/`.
- Layer contract per module: controller (HTTP only) → service (rules, events, HTTP exceptions) →
  repository (the only place that talks to TypeORM) → entity. Controllers never call repositories.
- Every response goes through `ResponseEnvelopeInterceptor` (`{ success, data, error, meta? }`). Return a
  `Paginated<T>` from services (`@common/types/paginated`) to get `meta` lifted automatically.
- Every error goes through `AllExceptionsFilter`; codes come from the `HttpStatus` enum name
  (`NOT_FOUND`, `CONFLICT`) or `VALIDATION_ERROR`.
- Guards are global (`ThrottlerGuard`, `AuthGuard`, `RolesGuard`, in that order). Use `@Public()` for open
  routes and `@Roles([...])` for role gates, both from the auth module's `decorators`. Resource-level checks
  (own section, own child) go in services. Roles are the `Role` enum in the auth module; validate request
  DTOs with `@IsEnum(Role, { each: true })`.
- Review conventions (apply everywhere): closed sets of named values (roles, statuses, kinds, purposes)
  are TypeScript `enum`s owned by their module; `as const` objects are only for data tables (templates,
  merge-field labels). `any` is banned (`strict: true`, eslint `no-explicit-any: error`); `unknown` only at
  true boundaries (caught errors, raw payloads) and narrowed immediately. Every object shape that is not
  a request/response DTO gets a named `interface` (no inline `{ a: x }` types in signatures, no
  `Record<string, ...>` where the keys are known); interfaces are plain (no `readonly`); a type is an
  `interface`/`type`, never a class. Helper functions used by one class are `private` methods of that
  class. Nothing domain-specific lives in `common/` (owning module, or a shared domain folder when several
  modules need it). Follow the framework's documented way before inventing a wrapper. Tests use typed
  fixtures and the helpers in `test/utils`, never `as never`, `as object` or `as unknown as`.
- Config: each `src/config/<name>/<name>.config.ts` is a `registerAs` factory that validates its own env
  class through the generic `validateConfig` (`@common/utils/validate/validate-config`, throws
  `InternalServerErrorException` listing every invalid variable, never the values) and is injected as
  `@Inject(xConfig.KEY) x: ConfigType<typeof xConfig>` (module factories use `inject: [xConfig.KEY]`). Import
  `ConfigType` with `import type` when it appears in a decorated signature. Specs provide
  `{ provide: xConfig.KEY, useValue: {...} }`. New env vars go in the namespace that owns them, with the
  returned shape added to that folder's `*.type.ts`. All five namespaces are loaded in `app.module.ts`
  (`ConfigModule.forRoot`, global, cached, `.env.local` then `.env`).
- Database: `TypeOrmConfigService` builds the options from `databaseConfig` (`DATABASE_URL`) with
  `autoLoadEntities: true` and `synchronize: false`. Do not pass a `dataSourceFactory` unless the data source
  must be wrapped; `forRootAsync` already creates and initializes it. Schema changes go through TypeORM
  migrations, never `synchronize`.
- Entities: every module owns its `<name>.entity.ts` files and registers them with
  `TypeOrmModule.forFeature([...])`. Response DTOs map entities explicitly so internal columns never leak.
- DTOs: class-validator on every request DTO. Types used in decorated signatures must be imported with
  `import type` (isolatedModules + emitDecoratorMetadata).
- Tenancy (intended design, to be re-implemented on TypeORM): every tenant table carries `institution_id`
  and is protected by Postgres row-level security keyed on a per-transaction `app.institution_id` setting,
  opened once the bearer token is verified (there is no auth middleware; only `LoggerMiddleware` runs on every request). Tenant-scoped references use composite
  foreign keys `(institution_id, <fk>)` → `(institution_id, id)` because Postgres checks foreign keys as the
  table owner and bypasses RLS. The app must connect as a non-superuser owner role so FORCE RLS applies;
  pre-auth lookups and platform work use a separate NOLOGIN `BYPASSRLS` role. Never connect as a superuser.
- Events: extend a `DomainEvent` base in `<module>/events/` and publish via `@nestjs/event-emitter`.
  `@OnEvent` listeners run inside the publishing request, so they must catch their own errors: a failed side
  effect must not fail the request.
- Audit: anything backdated, overriding or financial goes through an audit service. The audit table is
  append-only (a trigger rejects UPDATE/DELETE).
- Dates: attendance and leave compare ISO date strings; "today" is `todayLocal()` (Asia/Dhaka), never
  `new Date()` on the server clock.
- Keep `@nestjs/config`, `@nestjs/jwt`, `@nestjs/event-emitter`, `@nestjs/axios` on the majors that
  match Nest 11 (4.x, 11.x, 3.x, 4.x). Their 12.x releases are ESM-only and break Jest under CommonJS.
  `@nestjs/typeorm` is on 12.x and `typeorm` on 1.x; check their release notes before bumping.
- File uploads use `FileInterceptor` from `@nestjs/platform-express` with a size limit; `Express.Multer.File`
  needs `multer` in tsconfig `types` (the list is explicit, so new ambient type packages must be added there).
- Excel goes through `exceljs` (CJS). Spreadsheet reading/writing lives in one file per module
  (`import/spreadsheet.ts`); services see typed rows, never cells.
- Outbound HTTP goes through `HttpService` from a module-local `HttpModule.registerAsync` (timeout
  from `httpConfig`); wrap calls in `firstValueFrom`, map failures to `ServiceUnavailableException`, and
  never log request bodies that may contain codes or personal data.
- SMS: guardian-facing messages go through `BatchesService` (consent, cost preview, ledger, log), never
  `SmsService.send()`, which is for transactional traffic only (OTP). Money is in paisa integers; the
  `sms_ledger` table is append-only like the audit table. Modules that want to notify guardians call
  `BatchesService.draftForSystem()` with a `dedupeKey` and let the office send; they never send
  directly (Spec v2 §9: cost before send). Fan-out uses `mapWithConcurrency`.

## Commands

Package manager is **yarn** (`yarn.lock` is the only lockfile; there is no `package-lock.json`).
`node_modules/` is not installed by default.

```bash
yarn install
yarn start:dev        # watch mode, http://localhost:<PORT>/api
yarn build            # nest build -> dist/ (deleteOutDir: true, so dist/ is wiped first)
yarn start:prod       # node dist/main
yarn lint             # eslint with --fix baked in — it rewrites files
yarn format           # prettier --write over src/ and test/
yarn test             # unit tests
yarn test:cov         # coverage -> ./coverage
yarn test:e2e         # uses test/jest-e2e.json
yarn typecheck        # tsc --noEmit
```

Run a single unit test:

```bash
yarn test app.controller                     # positional path pattern
yarn test --testPathPatterns=app.controller  # Jest 30 renamed --testPathPattern (plural now)
yarn test -t "should return"                 # by test name
```

There are no `db:generate` / `db:migrate` scripts any more (they belonged to drizzle-kit); add TypeORM
migration scripts when the first migration is written. `db:seed` still points at the old
`dist/database/seed` and is stale. There is no DB bootstrap script yet: create the database and role by hand
and point `DATABASE_URL` at it.
Environment is loaded from `.env.local` then `.env` and validated at boot by the `registerAs` factories in
[src/config/](src/config/); a missing or invalid variable aborts startup with one message listing all of
them. The API is served under the `/api` prefix.

## Test layout

Two separate Jest configs, and they do not see each other's files:

- **Unit** — config is inline in [package.json](package.json). `rootDir` is `src`, pattern is
  `*.spec.ts`. Unit tests live *beside* the code they test, not in `test/`.
- **E2E** — [test/jest-e2e.json](test/jest-e2e.json). `rootDir` is `test/` (aliases map to
  `<rootDir>/../src`), pattern is `*.e2e-spec.ts`, and `test/setup-env.ts` sets env vars before
  any module import (config validation runs at import time). These boot the real Nest app via
  `Test.createTestingModule` + supertest and override repositories and the database so no Postgres is needed.

Testing conventions:

- Every service/controller spec builds its subject with `Test.createTestingModule({ providers: [X] })
  .useMocker(createMock)` from [test/utils/create-mock.ts](test/utils/create-mock.ts) and reads mocks
  back with `getMock(moduleRef, Dep)` (typed `jest.Mocked<Dep>`). This exercises Nest's injector, so a
  missing `@Injectable()` or wrong `@Inject()` token fails the spec. Direct `new Service()` is only for
  code with no DI at all (pure DTO/helper specs).
- Provide real values only where a constructor reads config at construction time
  (`{ provide: smsConfig.KEY, useValue: {...} }`); everything else is auto-mocked.
- E2E specs override repositories with `createMock<XRepository>()` and the database with `{}`.
- Fixtures are full typed objects (`const row: LeaveApplication = {...}`), never partial objects cast
  with `as never`. Asymmetric matchers go through `anyOf(Date)` / `containing<AuditEntry>({...})` from
  [test/utils/matchers.ts](test/utils/matchers.ts), the one place Jest's `any`-typed matchers are adapted.

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
