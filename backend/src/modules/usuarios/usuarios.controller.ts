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
import { Role } from './usuario.entity';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_EMPRESA)
  criar(
    @Body() dto: CreateUsuarioDto,
    @CurrentUser() user: { id: string; role: Role; empresaId: string },
  ) {
    return this.usuariosService.criar(dto, user.id, user.role, user.empresaId);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_EMPRESA)
  listar(@CurrentUser() user: { role: Role; empresaId: string }) {
    return this.usuariosService.listar(user);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_EMPRESA)
  buscar(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { role: Role; empresaId: string },
  ) {
    const empresaId = user.role === Role.SUPER_ADMIN ? undefined : user.empresaId;
    return this.usuariosService.buscarPorId(id, empresaId);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_EMPRESA)
  atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUsuarioDto,
    @CurrentUser() user: { role: Role; empresaId: string },
  ) {
    const empresaId = user.role === Role.SUPER_ADMIN ? undefined : user.empresaId;
    return this.usuariosService.atualizar(id, dto, empresaId);
  }
}
