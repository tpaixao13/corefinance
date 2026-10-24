import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  Headers,
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
import { PermissaoGuard } from '../../common/guards/permissao.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequerPermissao } from '../../common/decorators/requer-permissao.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../usuarios/usuario.entity';
import { ChavePermissao } from '../usuarios/usuario-permissao.entity';
import { ExtratosService } from './extratos.service';

@Controller('extratos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExtratosController {
  constructor(private readonly extratosService: ExtratosService) {}

  private resolveEmpresaId(user: { role: Role; empresaId: string }, header: string): string {
    if (user.role === Role.SUPER_ADMIN) {
      if (!header) throw new BadRequestException('Selecione uma empresa antes de continuar');
      return header;
    }
    return user.empresaId;
  }

  @Post('importar/:contaId')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_EMPRESA)
  @RequerPermissao(ChavePermissao.EXTRATO_IMPORT)
  @UseGuards(PermissaoGuard)
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
    @Headers('x-empresa-id') header: string,
  ) {
    if (!arquivo) throw new BadRequestException('Arquivo é obrigatório');
    return this.extratosService.importar(contaId, this.resolveEmpresaId(user, header), user.id, arquivo);
  }

  @Get('importacoes')
  listarImportacoes(
    @CurrentUser() user: { role: Role; empresaId: string },
    @Headers('x-empresa-id') header: string,
    @Query('contaId') contaId?: string,
  ) {
    return this.extratosService.listarImportacoes(this.resolveEmpresaId(user, header), contaId);
  }

  @Get('lancamentos/:contaId')
  listarLancamentos(
    @Param('contaId', ParseUUIDPipe) contaId: string,
    @CurrentUser() user: { role: Role; empresaId: string },
    @Headers('x-empresa-id') header: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.extratosService.listarLancamentos(this.resolveEmpresaId(user, header), contaId, page, limit);
  }

  @Delete('lancamentos/:id')
  @Roles(Role.SUPER_ADMIN)
  excluirLancamento(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string; role: Role; empresaId: string },
    @Headers('x-empresa-id') header: string,
  ) {
    return this.extratosService.excluirLancamento(id, this.resolveEmpresaId(user, header), user.id);
  }
}
