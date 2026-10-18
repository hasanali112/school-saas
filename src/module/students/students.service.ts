import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthUser } from '@modules/auth/auth-user';
import { paginate, Paginated } from '@common/types/paginated';
import { isUniqueViolation } from '@database/database.errors';
import { StudentRow } from '@database/schema';
import { DomainEvents } from '@shared/events/domain-events.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { ExitStudentDto } from './dto/exit-student.dto';
import { ListStudentsQueryDto } from './dto/list-students-query.dto';
import { StudentResponseDto } from './dto/student.response.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentCreatedEvent } from './events/student-created.event';
import { StudentExitedEvent } from './events/student-exited.event';
import { StudentsRepository } from './students.repository';

@Injectable()
export class StudentsService {
  constructor(
    private readonly repo: StudentsRepository,
    private readonly events: DomainEvents,
  ) {}

  async create(
    dto: CreateStudentDto,
    actor: AuthUser,
  ): Promise<StudentResponseDto> {
    let row: StudentRow;
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
    if (current.status === 'exited')
      throw new ConflictException('Student has already exited');

    const row = await this.repo.update(id, {
      status: 'exited',
      exitedAt: new Date(),
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
      {
        search: query.search,
        status: query.status,
      },
    );
    return paginate(
      StudentResponseDto.fromMany(rows),
      total,
      query.page,
      query.limit,
    );
  }

  private async requireRow(id: string): Promise<StudentRow> {
    const row = await this.repo.findById(id);
    if (!row) throw new NotFoundException(`Student ${id} not found`);
    return row;
  }
}
