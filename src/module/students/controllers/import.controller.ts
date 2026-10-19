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
import type { Response } from 'express';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Roles } from '@common/decorators/roles.decorator';
import type { AuthUser } from '@common/types/auth-user';
import { STUDENT_WRITE_ROLES } from './student-roles';
import { ImportQueryDto } from '../dto/import-query.dto';
import { ImportSummaryDto } from '../dto/import-summary.response.dto';
import { ImportFacade } from '../services/import.facade';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const XLSX_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

@Controller('students/import')
@Roles(STUDENT_WRITE_ROLES)
export class ImportController {
  constructor(private readonly imports: ImportFacade) {}

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
