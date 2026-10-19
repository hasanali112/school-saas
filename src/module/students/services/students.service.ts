import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isUniqueViolation } from '@common/services/database/database-errors';
import { paginate, Paginated } from '@common/types/paginated';
import type { AuthUser } from '@common/types/auth-user';
import { EventPublisherPort } from '@module/events/application/ports/event-publisher.port';
import { ClockPort } from '@module/time/application/ports/clock.port';
import { StudentStatus } from '../domain/student';
import type { Student } from '../domain/student';
import { CreateStudentDto } from '../dto/create-student.dto';
import { ExitStudentDto } from '../dto/exit-student.dto';
import { ListStudentsQueryDto } from '../dto/list-students-query.dto';
import { StudentResponseDto } from '../dto/student.response.dto';
import { UpdateStudentDto } from '../dto/update-student.dto';
import { StudentCreatedEvent } from '../events/student-created.event';
import { StudentExitedEvent } from '../events/student-exited.event';
import { StudentsRepository } from '../application/ports/students.repository.port';

@Injectable()
export class StudentsService {
  constructor(
    private readonly repo: StudentsRepository,
    private readonly events: EventPublisherPort,
    private readonly clock: ClockPort,
  ) {}

  async create(
    dto: CreateStudentDto,
    actor: AuthUser,
  ): Promise<StudentResponseDto> {
    let row: Student;
    try {
      row = await this.repo.insert({
        ...dto,
        institutionId: actor.institutionId,
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(
          `Admission number ${dto.admissionNo} already exists`,
        );
      }
      throw error;
    }

    this.events.publish(
      new StudentCreatedEvent(actor.institutionId, row.id, actor.id),
    );
    return StudentResponseDto.from(row);
  }

  async getById(id: string): Promise<StudentResponseDto> {
    return StudentResponseDto.from(await this.requireRow(id));
  }

  async update(id: string, dto: UpdateStudentDto): Promise<StudentResponseDto> {
    const row = await this.repo.update(id, dto);
    if (!row) throw new NotFoundException(`Student ${id} not found`);
    return StudentResponseDto.from(row);
  }

  /** Terminal state: the record stays for statutory retention but leaves every active count. */
  async exit(
    id: string,
    dto: ExitStudentDto,
    actor: AuthUser,
  ): Promise<StudentResponseDto> {
    const current = await this.requireRow(id);
    if (current.status === StudentStatus.Exited)
      throw new ConflictException('Student has already exited');

    const row = await this.repo.update(id, {
      status: StudentStatus.Exited,
      exitedAt: this.clock.now(),
      exitReason: dto.reason,
    });
    if (!row) throw new NotFoundException(`Student ${id} not found`);

    this.events.publish(
      new StudentExitedEvent(actor.institutionId, id, actor.id, dto.reason),
    );
    return StudentResponseDto.from(row);
  }

  async list(
    query: ListStudentsQueryDto,
  ): Promise<Paginated<StudentResponseDto>> {
    const { rows, total } = await this.repo.findPage(
      query.offset,
      query.limit,
      { search: query.search, status: query.status },
    );
    return paginate(StudentResponseDto.fromMany(rows), total, query);
  }

  private async requireRow(id: string): Promise<Student> {
    const row = await this.repo.findById(id);
    if (!row) throw new NotFoundException(`Student ${id} not found`);
    return row;
  }
}
