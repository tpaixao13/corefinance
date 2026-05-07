import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conciliacao } from './conciliacao.entity';
import { ExtratoLancamento } from '../extratos/extrato-lancamento.entity';
import { ConciliacaoService } from './conciliacao.service';
import { ConciliacaoController } from './conciliacao.controller';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conciliacao, ExtratoLancamento]),
    AuditoriaModule,
  ],
  providers: [ConciliacaoService],
  controllers: [ConciliacaoController],
  exports: [ConciliacaoService],
})
export class ConciliacaoModule {}
