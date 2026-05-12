import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContaBancaria } from './conta-bancaria.entity';
import { ContasBancariasService } from './contas-bancarias.service';
import { ContasBancariasController } from './contas-bancarias.controller';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { PermissoesGuardModule } from '../../common/guards/permissoes-guard.module';

@Module({
  imports: [TypeOrmModule.forFeature([ContaBancaria]), AuditoriaModule, PermissoesGuardModule],
  providers: [ContasBancariasService],
  controllers: [ContasBancariasController],
  exports: [ContasBancariasService],
})
export class ContasBancariasModule {}
