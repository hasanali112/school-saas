import { Injectable } from '@nestjs/common';
import { Paginated } from '@common/types/paginated';
import type { AuthUser } from '@module/auth/domain/auth-user';
import {
  BatchResponseDto,
  MessageResponseDto,
  PreviewDto,
} from '../dto/batch.response.dto';
import { ComposeDto, ListBatchesQueryDto } from '../dto/compose.dto';
import { BatchesService } from './batches.service';

@Injectable()
export class BatchesFacade {
  constructor(private readonly batches: BatchesService) {}

  preview(dto: ComposeDto): Promise<PreviewDto> {
    return this.batches.preview(dto);
  }

  create(dto: ComposeDto, actor: AuthUser): Promise<BatchResponseDto> {
    return this.batches.create(dto, actor);
  }

  list(query: ListBatchesQueryDto): Promise<Paginated<BatchResponseDto>> {
    return this.batches.list(query);
  }

  get(id: string): Promise<BatchResponseDto> {
    return this.batches.get(id);
  }

  messages(id: string): Promise<MessageResponseDto[]> {
    return this.batches.messages(id);
  }

  send(id: string, actor: AuthUser): Promise<BatchResponseDto> {
    return this.batches.send(id, actor);
  }

  cancel(id: string): Promise<BatchResponseDto> {
    return this.batches.cancel(id);
  }
}
