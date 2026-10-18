import { DefaultNamingStrategy, NamingStrategyInterface } from 'typeorm';

/** `nameBn` → `name_bn`, so entities need no `name:` on every column. */
export class SnakeNamingStrategy
  extends DefaultNamingStrategy
  implements NamingStrategyInterface
{
  columnName(
    propertyName: string,
    customName: string | undefined,
    embeddedPrefixes: string[],
  ): string {
    return (
      customName ?? this.toSnake([...embeddedPrefixes, propertyName].join('_'))
    );
  }

  private toSnake(value: string): string {
    return value.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
  }
}
