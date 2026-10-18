import { Injectable } from '@nestjs/common';
import type { AuthUser } from '@module/auth/domain/auth-user';
import {
  ApplyLeaveDto,
  CreateLeaveTypeDto,
  DecideLeaveDto,
  ListLeaveQueryDto,
} from '../dto/leave.dto';
import {
  LeaveApplicationResponseDto,
  LeaveTypeResponseDto,
} from '../dto/leave.response.dto';
import { LeaveService } from './leave.service';

@Injectable()
export class LeaveFacade {
  constructor(private readonly leave: LeaveService) {}

  createType(
    dto: CreateLeaveTypeDto,
    actor: AuthUser,
  ): Promise<LeaveTypeResponseDto> {
    return this.leave.createType(dto, actor);
  }

  listTypes(): Promise<LeaveTypeResponseDto[]> {
    return this.leave.listTypes();
  }

  apply(
    dto: ApplyLeaveDto,
    actor: AuthUser,
  ): Promise<LeaveApplicationResponseDto> {
    return this.leave.apply(dto, actor);
  }

  list(
    query: ListLeaveQueryDto,
    actor: AuthUser,
  ): Promise<LeaveApplicationResponseDto[]> {
    return this.leave.list(query, actor);
  }

  approve(
    id: string,
    dto: DecideLeaveDto,
    actor: AuthUser,
  ): Promise<LeaveApplicationResponseDto> {
    return this.leave.approve(id, dto, actor);
  }

  reject(
    id: string,
    dto: DecideLeaveDto,
    actor: AuthUser,
  ): Promise<LeaveApplicationResponseDto> {
    return this.leave.reject(id, dto, actor);
  }

  cancel(id: string, actor: AuthUser): Promise<LeaveApplicationResponseDto> {
    return this.leave.cancel(id, actor);
  }
}
