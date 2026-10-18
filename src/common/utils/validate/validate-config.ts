import { InternalServerErrorException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';

export type EnvClass<T extends object> = new () => T;

const INDENT = '  ';

function formatErrors(
  errors: ValidationError[],
  parentPath: string = '',
): string[] {
  return errors.flatMap((error) => {
    const path = parentPath
      ? `${parentPath}.${error.property}`
      : error.property;
    const own = Object.values(error.constraints ?? {}).map(
      (message) => `${INDENT}- ${path}: ${message}`,
    );
    return [...own, ...formatErrors(error.children ?? [], path)];
  });
}

export function validateConfig<T extends object>(
  envClass: EnvClass<T>,
  config: Record<string, unknown>,
): T {
  const instance = plainToInstance(envClass, config, {
    exposeDefaultValues: true,
  });
  const errors = validateSync(instance, {
    skipMissingProperties: false,
    forbidUnknownValues: false,
  });

  if (errors.length > 0) {
    throw new InternalServerErrorException(
      [
        `Invalid configuration for ${envClass.name}:`,
        ...formatErrors(errors),
      ].join('\n'),
    );
  }
  return instance;
}
