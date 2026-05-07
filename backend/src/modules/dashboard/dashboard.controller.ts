import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../usuarios/usuario.entity';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('conta/:contaId')
  resumoConta(
    @Param('contaId', ParseUUIDPipe) contaId: string,
    @CurrentUser() user: { role: Role; empresaId: string },
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    return this.dashboardService.resumoPorConta(
      contaId,
      user.empresaId,
      dataInicio ? new Date(dataInicio) : undefined,
      dataFim ? new Date(dataFim) : undefined,
    );
  }

  @Get('empresa')
  resumoEmpresa(@CurrentUser() user: { role: Role; empresaId: string }) {
    return this.dashboardService.resumoPorEmpresa(user.empresaId);
  }

  @Get('empresas')
  @Roles(Role.SUPER_ADMIN)
  resumoTodasEmpresas() {
    return this.dashboardService.resumoTodasEmpresas();
  }

  @Get('conta/:contaId/evolucao')
  evolucaoSaldo(
    @Param('contaId', ParseUUIDPipe) contaId: string,
    @CurrentUser() user: { role: Role; empresaId: string },
    @Query('meses', new DefaultValuePipe(6), ParseIntPipe) meses: number,
  ) {
    return this.dashboardService.evolucaoSaldo(contaId, user.empresaId, meses);
  }
}
