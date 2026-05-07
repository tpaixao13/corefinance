import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../usuarios/usuario.entity';
import { EmpresasService } from './empresas.service';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

@Controller('empresas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmpresasController {
  constructor(private readonly empresasService: EmpresasService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN)
  criar(
    @Body() dto: CreateEmpresaDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.empresasService.criar(dto, user.id);
  }

  @Get()
  listar(@CurrentUser() user: { role: Role; empresaId: string }) {
    const empresaId = user.role === Role.SUPER_ADMIN ? undefined : user.empresaId;
    return this.empresasService.listar(empresaId);
  }

  @Get(':id')
  buscar(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { role: Role; empresaId: string },
  ) {
    const empresaId = user.role === Role.SUPER_ADMIN ? undefined : user.empresaId;
    return this.empresasService.buscarPorId(id, empresaId);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN)
  atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEmpresaDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.empresasService.atualizar(id, dto, user.id);
  }
}
