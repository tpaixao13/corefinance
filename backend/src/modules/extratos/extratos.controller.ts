import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../usuarios/usuario.entity';
import { ExtratosService } from './extratos.service';

@Controller('extratos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExtratosController {
  constructor(private readonly extratosService: ExtratosService) {}

  @Post('importar/:contaId')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_EMPRESA)
  @UseInterceptors(
    FileInterceptor('arquivo', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: (_req, file, cb) => {
        const extensoesPermitidas = ['ofx', 'qfx', 'csv', 'xlsx', 'xls'];
        const ext = file.originalname.split('.').pop()?.toLowerCase();
        if (!ext || !extensoesPermitidas.includes(ext)) {
          return cb(new BadRequestException('Formato não suportado. Use OFX, CSV ou XLSX.'), false);
        }
        cb(null, true);
      },
    }),
  )
  importar(
    @Param('contaId', ParseUUIDPipe) contaId: string,
    @UploadedFile() arquivo: Express.Multer.File,
    @CurrentUser() user: { id: string; role: Role; empresaId: string },
  ) {
    if (!arquivo) throw new BadRequestException('Arquivo é obrigatório');
    return this.extratosService.importar(contaId, user.empresaId, user.id, arquivo);
  }

  @Get('importacoes')
  listarImportacoes(
    @CurrentUser() user: { role: Role; empresaId: string },
    @Query('contaId') contaId?: string,
  ) {
    return this.extratosService.listarImportacoes(user.empresaId, contaId);
  }

  @Get('lancamentos/:contaId')
  listarLancamentos(
    @Param('contaId', ParseUUIDPipe) contaId: string,
    @CurrentUser() user: { role: Role; empresaId: string },
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.extratosService.listarLancamentos(user.empresaId, contaId, page, limit);
  }
}
