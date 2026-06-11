import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Headers,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from './usuario.entity';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UpdatePermissaoDto } from './dto/update-permissao.dto';
import { ChavePermissao } from './usuario-permissao.entity';

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
  listar(
    @CurrentUser() user: { role: Role; empresaId: string },
    @Headers('x-empresa-id') header: string,
  ) {
    return this.usuariosService.listar(user, header);
  }

  @Get('minhas-permissoes')
  minhasPermissoes(@CurrentUser() user: { id: string; role: Role }) {
    if (user.role === Role.SUPER_ADMIN) {
      const tudo: Record<string, boolean> = {};
      for (const chave of Object.values(ChavePermissao)) tudo[chave] = true;
      return tudo;
    }
    return this.usuariosService.listarMinhasPermissoes(user.id);
  }

  @Get('permissoes')
  @Roles(Role.SUPER_ADMIN)
  listarComPermissoes() {
    return this.usuariosService.listarComPermissoes();
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

  @Post(':id/permissoes')
  @Roles(Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  atualizarPermissao(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePermissaoDto,
    @CurrentUser() user: { id: string; role: Role },
  ) {
    return this.usuariosService.atualizarPermissao(id, dto, user.id);
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
