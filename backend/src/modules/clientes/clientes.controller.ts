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
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../usuarios/usuario.entity';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Controller('clientes')
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
export class ClientesController {
  constructor(private readonly service: ClientesService) {}

  private resolveEmpresaId(user: { role: Role; empresaId: string }, header: string): string {
    if (user.role === Role.SUPER_ADMIN) {
      if (!header) throw new BadRequestException('Selecione uma empresa antes de continuar');
      return header;
    }
    return user.empresaId;
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_EMPRESA)
  criar(
    @Body() dto: CreateClienteDto,
    @CurrentUser() user: { role: Role; empresaId: string },
    @Headers('x-empresa-id') header: string,
  ) {
    return this.service.criar(dto, this.resolveEmpresaId(user, header));
  }

  @Get('buscar')
  buscar(
    @Query('q') q: string,
    @CurrentUser() user: { role: Role; empresaId: string },
    @Headers('x-empresa-id') header: string,
  ) {
    return this.service.buscar(this.resolveEmpresaId(user, header), q);
  }

  @Get()
  listar(
    @CurrentUser() user: { role: Role; empresaId: string },
    @Headers('x-empresa-id') header: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.service.listar(this.resolveEmpresaId(user, header), page, limit);
  }

  @Get(':id')
  buscarPorId(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: { role: Role; empresaId: string },
    @Headers('x-empresa-id') header: string,
  ) {
    return this.service.buscarPorId(id, this.resolveEmpresaId(user, header));
  }

  @Put(':id')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_EMPRESA)
  atualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClienteDto,
    @CurrentUser() user: { role: Role; empresaId: string },
    @Headers('x-empresa-id') header: string,
  ) {
    return this.service.atualizar(id, dto, this.resolveEmpresaId(user, header));
  }
}
