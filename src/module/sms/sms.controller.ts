import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import type { AuthUser } from '@modules/auth/auth-user';
import { Paginated } from '@common/types/paginated';
import { BatchesService } from './batches/batches.service';
import {
  BatchResponseDto,
  MessageResponseDto,
  PreviewDto,
} from './dto/batch.response.dto';
import { ComposeDto, ListBatchesQueryDto } from './dto/compose.dto';
import { SMS_OPERATORS } from './sms.constants';

/** Composer and log (F1-12 §2). */
@Controller('sms')
@Roles(SMS_OPERATORS)
export class SmsController {
  constructor(private readonly batches: BatchesService) {}

  /** Cost before send: nothing is stored. */
  @Post('preview')
  @HttpCode(HttpStatus.OK)
  preview(@Body() dto: ComposeDto): Promise<PreviewDto> {
    return this.batches.preview(dto);
  }

  @Post('batches')
  create(
    @Body() dto: ComposeDto,
    @CurrentUser() actor: AuthUser,
  ): Promise<BatchResponseDto> {
    return this.batches.create(dto, actor);
  }

  @Get('batches')
  list(
    @Query() query: ListBatchesQueryDto,
  ): Promise<Paginated<BatchResponseDto>> {
    return this.batches.list(query);
  }

  @Get('batches/:id')
  get(@Param('id', ParseUUIDPipe) id: string): Promise<BatchResponseDto> {
    return this.batches.get(id);
  }

  @Get('batches/:id/messages')
  messages(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MessageResponseDto[]> {
    return this.batches.messages(id);
  }

  @Post('batches/:id/send')
  @HttpCode(HttpStatus.OK)
  send(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthUser,
  ): Promise<BatchResponseDto> {
    return this.batches.send(id, actor);
  }

  @Post('batches/:id/cancel')
  @HttpCode(HttpStatus.OK)
  cancel(@Param('id', ParseUUIDPipe) id: string): Promise<BatchResponseDto> {
    return this.batches.cancel(id);
  }
}
