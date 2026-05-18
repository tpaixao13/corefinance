import {
  Controller,
  Get,
  Post,
  Put,
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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { PermissaoGuard } from '../../common/guards/permissao.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequerPermissao } from '../../common/decorators/requer-permissao.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../usuarios/usuario.entity';
import { ChavePermissao } from '../usuarios/usuario-permissao.entity';
import { ContasReceberService } from './contas-receber.service';
import { CreateContaReceberDto } from './dto/create-conta-receber.dto';
import { UpdateContaReceberDto } from './dto/update-conta-receber.dto';

@Controller('contas-receber')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
export class ContasReceberController {
  constructor(private readonly service: ContasReceberService) {}

  private resolveEmpresaId(
    user: { role: Role; empresaId: string },
    headerEmpresaId: string,
  ): string {
    if (user.role === Role.SUPER_ADMIN) {
      if (!headerEmpresaId) throw new BadRequestException('Selecione uma empresa antes de continuar');
      return headerEmpresaId;
    }
    return user.empresaId;
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_EMPRESA)
  @RequerPermissao(ChavePermissao.CONTAS_RECEBER_CREATE)
  @UseGuards(PermissaoGuard)
  criar(
    @Body() dto: CreateContaReceberDto,
    @CurrentUser() user: { id: string; role: Role; empresaId: string },
    @Headers('x-empresa-id') empresaIdHeader: string,
  ) {
    const empresaId = this.resolveEmpresaId(user, empresaIdHeader);
    return this.service.criar(dto, empresaId, user.id);
  }

  @Get()
  @RequerPermissao(ChavePermissao.CONTAS_RECEBER_VIEW)
  @UseGuards(PermissaoGuard)
  listar(
    @CurrentUser() user: { role: Role; empresaId: string },
    @Headers('x-empresa-id') empresaIdHeader: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('status') status?: string,
  ) {
    const empresaId = this.resolveEmpresaId(user, empresaIdHeader);
    return this.service.listar(empresaId, page, limit, status as any);
  }

  @Get(':id')
  @RequerPermissao(ChavePermissao.CONTAS_RECEBER_VIEW)
  @UseGuards(PermissaoGuard)
  buscar(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { role: Role; empresaId: string },
    @Headers('x-empresa-id') empresaIdHeader: string,
  ) {
    const empresaId = this.resolveEmpresaId(user, empresaIdHeader);
    return this.service.buscarPorId(id, empresaId);
  }

  @Put(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_EMPRESA)
  @RequerPermissao(ChavePermissao.CONTAS_RECEBER_EDIT)
  @UseGuards(PermissaoGuard)
  atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContaReceberDto,
    @CurrentUser() user: { id: string; role: Role; empresaId: string },
    @Headers('x-empresa-id') empresaIdHeader: string,
  ) {
    const empresaId = this.resolveEmpresaId(user, empresaIdHeader);
    return this.service.atualizar(id, dto, empresaId, user.id);
  }
}
