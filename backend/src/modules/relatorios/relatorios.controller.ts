import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../usuarios/usuario.entity';
import { RelatoriosService } from './relatorios.service';
import { RelatorioQueryDto, ExportarQueryDto } from './dto/relatorio-query.dto';

@Controller('relatorios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RelatoriosController {
  constructor(private readonly relatoriosService: RelatoriosService) {}

  @Get('permissoes-usuarios')
  @Roles(Role.SUPER_ADMIN)
  permissoesUsuarios() {
    return this.relatoriosService.listarPermissoesUsuarios();
  }

  @Get('dre')
  dre(
    @Query() query: RelatorioQueryDto,
    @CurrentUser() user: { role: Role; empresaId: string },
  ) {
    const empresaId = user.role === Role.SUPER_ADMIN
      ? (query.empresaId ?? user.empresaId)
      : user.empresaId;
    return this.relatoriosService.calcularDre(empresaId, query.dataInicio, query.dataFim);
  }

  @Get('financeiro')
  financeiro(
    @Query() query: RelatorioQueryDto,
    @CurrentUser() user: { role: Role; empresaId: string },
  ) {
    const empresaId = user.role === Role.SUPER_ADMIN
      ? (query.empresaId ?? user.empresaId)
      : user.empresaId;
    return this.relatoriosService.relatorioFinanceiro(empresaId, query.dataInicio, query.dataFim);
  }

  @Get('exportar')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN_EMPRESA)
  async exportar(
    @Query() query: ExportarQueryDto,
    @CurrentUser() user: { role: Role; empresaId: string },
    @Res() res: Response,
  ) {
    const empresaId = user.role === Role.SUPER_ADMIN
      ? (query.empresaId ?? user.empresaId)
      : user.empresaId;

    const tipo = query.tipo ?? 'geral';
    const csv = await this.relatoriosService.gerarCsv(empresaId, tipo, query.dataInicio, query.dataFim);

    const dataStr = new Date().toISOString().slice(0, 10);
    const filename = `relatorio-${tipo}-${dataStr}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    // BOM UTF-8 para compatibilidade com Excel
    res.send('﻿' + csv);
  }
}
