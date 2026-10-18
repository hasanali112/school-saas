/**
 * Jest-only stand-in for `@nestjs/typeorm/dist/common/typeorm-compat.js`, the one file of
 * that ESM-only package that uses `import.meta` (which cannot be compiled to CommonJS).
 * It looks up TypeORM 0.3 exports that TypeORM 1.x removed, so on our TypeORM it always
 * yields undefined; this stub returns the same.
 */
export const Connection = undefined;
export const AbstractRepository = undefined;
