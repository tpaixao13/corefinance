import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../usuarios/usuario.entity';
import { ContasBancariasService } from './contas-bancarias.service';
import { CreateContaBancariaDto } from './dto/create-conta-bancaria.dto';

@Controller('contas-bancarias')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContasBancariasController {
  constructor(private readonly contasService: ContasBancariasService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_EMPRESA)
  criar(
    @Body() dto: CreateContaBancariaDto,
    @CurrentUser() user: { id: string; role: Role; empresaId: string },
  ) {
    return this.contasService.criar(dto, user.id, user.role, user.empresaId);
  }

  @Get()
  listar(@CurrentUser() user: { role: Role; empresaId: string }) {
    const empresaId = user.role === Role.SUPER_ADMIN ? undefined : user.empresaId;
    return this.contasService.listar(empresaId);
  }

  @Get(':id')
  buscar(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { role: Role; empresaId: string },
  ) {
    const empresaId = user.role === Role.SUPER_ADMIN ? undefined : user.empresaId;
    return this.contasService.buscarPorId(id, empresaId);
  }

  @Patch(':id/recalcular-saldo')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_EMPRESA)
  recalcularSaldo(@Param('id', ParseUUIDPipe) id: string) {
    return this.contasService.recalcularSaldo(id);
  }
}
