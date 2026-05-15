import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdemServico } from './ordem-servico.entity';
import { OrdensServicoService } from './ordens-servico.service';
import { OrdensServicoController } from './ordens-servico.controller';
import { OsMailService } from './os-mail.service';
import { ContasReceberModule } from '../contas-receber/contas-receber.module';
import { PermissoesGuardModule } from '../../common/guards/permissoes-guard.module';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { Empresa } from '../empresas/empresa.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrdemServico, Empresa]),
    ContasReceberModule,
    PermissoesGuardModule,
    AuditoriaModule,
  ],
  providers: [OrdensServicoService, OsMailService],
  controllers: [OrdensServicoController],
})
export class OrdensServicoModule {}
