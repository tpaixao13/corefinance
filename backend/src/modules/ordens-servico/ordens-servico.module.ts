import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdemServico } from './ordem-servico.entity';
import { OrdensServicoService } from './ordens-servico.service';
import { OrdensServicoController } from './ordens-servico.controller';
import { ContasReceberModule } from '../contas-receber/contas-receber.module';
import { PermissoesGuardModule } from '../../common/guards/permissoes-guard.module';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrdemServico]),
    ContasReceberModule,
    PermissoesGuardModule,
    AuditoriaModule,
  ],
  providers: [OrdensServicoService],
  controllers: [OrdensServicoController],
})
export class OrdensServicoModule {}
