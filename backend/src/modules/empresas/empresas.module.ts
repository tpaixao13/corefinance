import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empresa } from './empresa.entity';
import { EmpresasService } from './empresas.service';
import { EmpresasController } from './empresas.controller';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [TypeOrmModule.forFeature([Empresa]), AuditoriaModule],
  providers: [EmpresasService],
  controllers: [EmpresasController],
  exports: [EmpresasService],
})
export class EmpresasModule {}
