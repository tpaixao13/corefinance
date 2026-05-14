import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContaReceber } from './conta-receber.entity';
import { ContasReceberService } from './contas-receber.service';
import { ContasReceberController } from './contas-receber.controller';
import { PermissoesGuardModule } from '../../common/guards/permissoes-guard.module';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [TypeOrmModule.forFeature([ContaReceber]), PermissoesGuardModule, AuditoriaModule],
  providers: [ContasReceberService],
  controllers: [ContasReceberController],
  exports: [ContasReceberService],
})
export class ContasReceberModule {}
