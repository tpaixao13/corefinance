import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissaoGuard } from '../../common/guards/permissao.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequerPermissao } from '../../common/decorators/requer-permissao.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../usuarios/usuario.entity';
import { ChavePermissao } from '../usuarios/usuario-permissao.entity';
import { ContasBancariasService } from './contas-bancarias.service';
import { CreateContaBancariaDto } from './dto/create-conta-bancaria.dto';
import { UpdateContaBancariaDto } from './dto/update-conta-bancaria.dto';

@Controller('contas-bancarias')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContasBancariasController {
  constructor(private readonly contasService: ContasBancariasService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_EMPRESA)
  @RequerPermissao(ChavePermissao.CONTA_BANCARIA_CREATE)
  @UseGuards(PermissaoGuard)
  criar(
    @Body() dto: CreateContaBancariaDto,
    @CurrentUser() user: { id: string; role: Role; empresaId: string },
  ) {
    return this.contasService.criar(dto, user.id, user.role, user.empresaId);
  }

  @Get()
  @RequerPermissao(ChavePermissao.CONTA_BANCARIA_VIEW)
  @UseGuards(PermissaoGuard)
  listar(@CurrentUser() user: { role: Role; empresaId: string }) {
    const empresaId = user.role === Role.SUPER_ADMIN ? undefined : user.empresaId;
    return this.contasService.listar(empresaId);
  }

  @Get(':id')
  @RequerPermissao(ChavePermissao.CONTA_BANCARIA_VIEW)
  @UseGuards(PermissaoGuard)
  buscar(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { role: Role; empresaId: string },
  ) {
    const empresaId = user.role === Role.SUPER_ADMIN ? undefined : user.empresaId;
    return this.contasService.buscarPorId(id, empresaId);
  }

  @Put(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_EMPRESA)
  @RequerPermissao(ChavePermissao.CONTA_BANCARIA_EDIT)
  @UseGuards(PermissaoGuard)
  atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContaBancariaDto,
    @CurrentUser() user: { id: string; role: Role; empresaId: string },
  ) {
    const empresaId = user.role === Role.SUPER_ADMIN ? undefined : user.empresaId;
    return this.contasService.atualizar(id, dto, user.id, empresaId);
  }

  @Patch(':id/recalcular-saldo')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_EMPRESA)
  recalcularSaldo(@Param('id', ParseUUIDPipe) id: string) {
    return this.contasService.recalcularSaldo(id);
  }
}
