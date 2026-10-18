import { Reflector } from '@nestjs/core';

/** Marks a route as reachable without a token (health, public website endpoints). */
export const Public = Reflector.createDecorator<boolean>({
  transform: () => true,
});
