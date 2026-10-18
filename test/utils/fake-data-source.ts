/** The parts of TypeORM's DataSource that `TypeOrmModule` touches while the app boots. */
export interface FakeDataSource {
  isInitialized: boolean;
  entityMetadatas: never[];
  options: { type: 'postgres' };
  manager: object;
  getRepository(): object;
  destroy(): Promise<void>;
}

/**
 * Stands in for the DataSource in e2e specs (`.overrideProvider(DataSource)`), so the app
 * boots without Postgres. Every repository port is overridden with a mock, so nothing
 * queries through it; it only satisfies the providers `TypeOrmModule.forFeature` creates.
 */
export function fakeDataSource(): FakeDataSource {
  return {
    isInitialized: false,
    entityMetadatas: [],
    options: { type: 'postgres' },
    manager: {},
    getRepository: () => ({}),
    destroy: () => Promise.resolve(),
  };
}
