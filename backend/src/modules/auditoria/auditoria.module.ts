import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditoriaLog } from './auditoria-log.entity';
import { AuditoriaService } from './auditoria.service';
import { AuditoriaController } from './auditoria.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AuditoriaLog])],
  providers: [AuditoriaService],
  controllers: [AuditoriaController],
  exports: [AuditoriaService],
})
export class AuditoriaModule {}
