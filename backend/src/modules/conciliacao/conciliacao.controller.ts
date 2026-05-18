import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  Headers,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
  BadRequestException,
} from '@nestjs/common';
import { IsArray, IsUUID, IsIn, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissaoGuard } from '../../common/guards/permissao.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequerPermissao } from '../../common/decorators/requer-permissao.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../usuarios/usuario.entity';
import { ChavePermissao } from '../usuarios/usuario-permissao.entity';
import { ConciliacaoService, ConfirmarMatchDto } from './conciliacao.service';
import { ConciliacaoManualDto } from './dto/conciliacao-manual.dto';

class MatchItemDto implements ConfirmarMatchDto {
  @IsUUID()
  lancamentoId: string;

  @IsUUID()
  contaErpId: string;

  @IsIn(['PAGAR', 'RECEBER'])
  tipo: 'PAGAR' | 'RECEBER';
}

class ConfirmarAutomaticaDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MatchItemDto)
  matches: MatchItemDto[];
}

@Controller('conciliacao')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConciliacaoController {
  constructor(private readonly conciliacaoService: ConciliacaoService) {}

  private resolveEmpresaId(user: { role: Role; empresaId: string }, header: string): string {
    if (user.role === Role.SUPER_ADMIN) {
      if (!header) throw new BadRequestException('Selecione uma empresa antes de continuar');
      return header;
    }
    return user.empresaId;
  }

  @Post('automatica/:contaId/preview')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_EMPRESA)
  @RequerPermissao(ChavePermissao.CONCILIACAO_EXECUTAR)
  @UseGuards(PermissaoGuard)
  previewAutomatica(
    @Param('contaId', ParseUUIDPipe) contaId: string,
    @CurrentUser() user: { role: Role; empresaId: string },
    @Headers('x-empresa-id') header: string,
  ) {
    return this.conciliacaoService.previewAutomatica(contaId, this.resolveEmpresaId(user, header));
  }

  @Post('automatica/:contaId/confirmar')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_EMPRESA)
  @RequerPermissao(ChavePermissao.CONCILIACAO_EXECUTAR)
  @UseGuards(PermissaoGuard)
  confirmarAutomatica(
    @Param('contaId', ParseUUIDPipe) contaId: string,
    @Body() dto: ConfirmarAutomaticaDto,
    @CurrentUser() user: { id: string; role: Role; empresaId: string },
    @Headers('x-empresa-id') header: string,
  ) {
    return this.conciliacaoService.confirmarAutomatica(dto.matches, contaId, this.resolveEmpresaId(user, header), user.id);
  }

  @Post('automatica/:contaId')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_EMPRESA)
  @RequerPermissao(ChavePermissao.CONCILIACAO_EXECUTAR)
  @UseGuards(PermissaoGuard)
  executarAutomatica(
    @Param('contaId', ParseUUIDPipe) contaId: string,
    @CurrentUser() user: { id: string; role: Role; empresaId: string },
    @Headers('x-empresa-id') header: string,
  ) {
    return this.conciliacaoService.executarAutomatica(contaId, this.resolveEmpresaId(user, header), user.id);
  }

  @Post('manual/:contaId')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_EMPRESA)
  @RequerPermissao(ChavePermissao.CONCILIACAO_EXECUTAR)
  @UseGuards(PermissaoGuard)
  executarManual(
    @Param('contaId', ParseUUIDPipe) contaId: string,
    @Body() dto: ConciliacaoManualDto,
    @CurrentUser() user: { id: string; role: Role; empresaId: string },
    @Headers('x-empresa-id') header: string,
  ) {
    return this.conciliacaoService.executarManual(dto, contaId, this.resolveEmpresaId(user, header), user.id);
  }

  @Delete('estornar/:conciliacaoId')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_EMPRESA)
  @RequerPermissao(ChavePermissao.CONCILIACAO_EXECUTAR)
  @UseGuards(PermissaoGuard)
  estornar(
    @Param('conciliacaoId', ParseUUIDPipe) conciliacaoId: string,
    @CurrentUser() user: { id: string; role: Role; empresaId: string },
    @Headers('x-empresa-id') header: string,
  ) {
    return this.conciliacaoService.estornar(conciliacaoId, this.resolveEmpresaId(user, header), user.id);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_EMPRESA)
  @RequerPermissao(ChavePermissao.CONCILIACAO_EXECUTAR)
  @UseGuards(PermissaoGuard)
  listar(
    @CurrentUser() user: { role: Role; empresaId: string },
    @Headers('x-empresa-id') header: string,
    @Query('contaId') contaId?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit = 50,
  ) {
    return this.conciliacaoService.listar(this.resolveEmpresaId(user, header), contaId, page, limit);
  }
}
