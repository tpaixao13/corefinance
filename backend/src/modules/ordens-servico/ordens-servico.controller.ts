import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
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
import { IsString, IsNotEmpty, IsDateString } from 'class-validator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { PermissaoGuard } from '../../common/guards/permissao.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequerPermissao } from '../../common/decorators/requer-permissao.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../usuarios/usuario.entity';
import { ChavePermissao } from '../usuarios/usuario-permissao.entity';
import { OrdensServicoService } from './ordens-servico.service';
import { CreateOrdemServicoDto } from './dto/create-ordem-servico.dto';
import { UpdateOrdemServicoDto } from './dto/update-ordem-servico.dto';

class FinalizarOsDto {
  @IsString()
  @IsNotEmpty()
  dataConclusao: string;
}

@Controller('ordens-servico')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
export class OrdensServicoController {
  constructor(private readonly service: OrdensServicoService) {}

  private resolveEmpresaId(user: { role: Role; empresaId: string }, headerEmpresaId: string): string {
    if (user.role === Role.SUPER_ADMIN) {
      if (!headerEmpresaId) throw new BadRequestException('Selecione uma empresa antes de continuar');
      return headerEmpresaId;
    }
    return user.empresaId;
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_EMPRESA)
  @RequerPermissao(ChavePermissao.ORDEM_SERVICO_CREATE)
  @UseGuards(PermissaoGuard)
  criar(
    @Body() dto: CreateOrdemServicoDto,
    @CurrentUser() user: { id: string; role: Role; empresaId: string },
    @Headers('x-empresa-id') empresaIdHeader: string,
  ) {
    return this.service.criar(dto, this.resolveEmpresaId(user, empresaIdHeader), user.id);
  }

  @Get()
  @RequerPermissao(ChavePermissao.ORDEM_SERVICO_VIEW)
  @UseGuards(PermissaoGuard)
  listar(
    @CurrentUser() user: { role: Role; empresaId: string },
    @Headers('x-empresa-id') empresaIdHeader: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.service.listar(this.resolveEmpresaId(user, empresaIdHeader), page, limit);
  }

  @Get(':id')
  @RequerPermissao(ChavePermissao.ORDEM_SERVICO_VIEW)
  @UseGuards(PermissaoGuard)
  buscar(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { role: Role; empresaId: string },
    @Headers('x-empresa-id') empresaIdHeader: string,
  ) {
    return this.service.buscarPorId(id, this.resolveEmpresaId(user, empresaIdHeader));
  }

  @Put(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_EMPRESA)
  @RequerPermissao(ChavePermissao.ORDEM_SERVICO_EDIT)
  @UseGuards(PermissaoGuard)
  atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrdemServicoDto,
    @CurrentUser() user: { id: string; role: Role; empresaId: string },
    @Headers('x-empresa-id') empresaIdHeader: string,
  ) {
    return this.service.atualizar(id, dto, this.resolveEmpresaId(user, empresaIdHeader), user.id);
  }

  @Patch(':id/finalizar')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_EMPRESA)
  @RequerPermissao(ChavePermissao.ORDEM_SERVICO_FINALIZAR)
  @UseGuards(PermissaoGuard)
  finalizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: FinalizarOsDto,
    @CurrentUser() user: { id: string; role: Role; empresaId: string },
    @Headers('x-empresa-id') empresaIdHeader: string,
  ) {
    return this.service.finalizar(id, dto.dataConclusao, this.resolveEmpresaId(user, empresaIdHeader), user.id);
  }

  @Patch(':id/cancelar')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_EMPRESA)
  @RequerPermissao(ChavePermissao.ORDEM_SERVICO_EDIT)
  @UseGuards(PermissaoGuard)
  cancelar(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { id: string; role: Role; empresaId: string },
    @Headers('x-empresa-id') empresaIdHeader: string,
  ) {
    return this.service.cancelar(id, this.resolveEmpresaId(user, empresaIdHeader), user.id);
  }
}
