import { Controller, Get, Query, UseGuards, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../usuarios/usuario.entity';
import { AuditoriaService } from './auditoria.service';

@Controller('auditoria')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_EMPRESA)
  listar(
    @CurrentUser() user: { role: Role; empresaId: string },
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('acao') acao?: string,
  ) {
    const empresaId = user.role === Role.SUPER_ADMIN ? undefined : user.empresaId;
    return this.auditoriaService.listar(empresaId, page, limit, acao);
  }
}
