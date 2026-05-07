import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContaBancaria } from '../contas-bancarias/conta-bancaria.entity';
import { ExtratoLancamento } from '../extratos/extrato-lancamento.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ContaBancaria, ExtratoLancamento])],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
