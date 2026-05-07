import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContaBancaria } from './conta-bancaria.entity';
import { ContasBancariasService } from './contas-bancarias.service';
import { ContasBancariasController } from './contas-bancarias.controller';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [TypeOrmModule.forFeature([ContaBancaria]), AuditoriaModule],
  providers: [ContasBancariasService],
  controllers: [ContasBancariasController],
  exports: [ContasBancariasService],
})
export class ContasBancariasModule {}
