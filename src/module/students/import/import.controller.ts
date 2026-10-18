import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Transform } from 'class-transformer';
import type { TransformFnParams } from 'class-transformer';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';
import type { Response } from 'express';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { Roles } from '@modules/auth/decorators/roles.decorator';
import type { AuthUser } from '@modules/auth/auth-user';
import { STUDENT_WRITE_ROLES } from '../students.controller';
import { ImportService } from './import.service';
import { ImportSummaryDto } from './import.types';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const XLSX_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/**
 * Reads the raw query value, not the converted one: with implicit conversion enabled,
 * Boolean('false') is true, so `value` would already be wrong by the time we see it.
 */
const toBool = ({ obj, key }: TransformFnParams): boolean => {
  const raw: unknown = (obj as Record<string, unknown>)[key];
  return raw === true || raw === 'true' || raw === '1';
};

class ImportQueryDto {
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  dryRun: boolean = true;

  /** Return the error workbook (xlsx) instead of JSON when there are errors. */
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  errorFile: boolean = false;

  @IsOptional()
  @IsUUID()
  sessionId?: string;
}
@Controller('students/import')
@Roles(STUDENT_WRITE_ROLES)
export class ImportController {
  constructor(private readonly imports: ImportService) {}

  @Get('template')
  async template(): Promise<StreamableFile> {
    return this.xlsxFile(
      await this.imports.template(),
      'students-import-template.xlsx',
    );
  }

  /**
   * Defaults to a dry run. Pass `dryRun=false` to write; the write is refused unless every row is valid.
   * Responds with the JSON summary, or the error workbook when `errorFile=true` and errors exist.
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_FILE_BYTES, files: 1 } }),
  )
  async import(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Query() query: ImportQueryDto,
    @CurrentUser() actor: AuthUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ImportSummaryDto | StreamableFile> {
    if (!file)
      throw new BadRequestException(
        'Upload the workbook as multipart field "file"',
      );
    if (!file.originalname.toLowerCase().endsWith('.xlsx')) {
      throw new BadRequestException('Only .xlsx files are accepted');
    }

    const { summary, errorFile } = await this.imports.import(
      file.buffer,
      { dryRun: query.dryRun, sessionId: query.sessionId },
      actor,
      query.errorFile,
    );
    if (errorFile) {
      res.setHeader(
        'X-Import-Summary',
        JSON.stringify({ ...summary, errors: undefined }),
      );
      return this.xlsxFile(errorFile, 'students-import-errors.xlsx');
    }
    if (!query.dryRun && summary.invalidRows > 0)
      res.status(HttpStatus.BAD_REQUEST);
    return summary;
  }

  private xlsxFile(buffer: Buffer, filename: string): StreamableFile {
    return new StreamableFile(buffer, {
      type: XLSX_MIME,
      disposition: `attachment; filename="${filename}"`,
    });
  }
}
