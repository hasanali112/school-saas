import { DomainEvent } from '@module/events/domain/domain-event';

/** Emitted once per marking call; absence SMS (F1-12) and attendance watch (F3-03d) subscribe. */
export class AttendanceMarkedEvent extends DomainEvent {
  static readonly NAME = 'attendance.marked';
  readonly name = AttendanceMarkedEvent.NAME;

  constructor(
    institutionId: string,
    readonly sectionId: string,
    readonly date: string,
    readonly period: number,
    readonly absentStudentIds: readonly string[],
    readonly actorId: string,
  ) {
    super(institutionId);
  }
}
