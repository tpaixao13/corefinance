import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContaPagar } from './conta-pagar.entity';
import { ContasPagarService } from './contas-pagar.service';
import { ContasPagarController } from './contas-pagar.controller';
import { PermissoesGuardModule } from '../../common/guards/permissoes-guard.module';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [TypeOrmModule.forFeature([ContaPagar]), PermissoesGuardModule, AuditoriaModule],
  providers: [ContasPagarService],
  controllers: [ContasPagarController],
  exports: [ContasPagarService],
})
export class ContasPagarModule {}
