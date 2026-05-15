import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from './cliente.entity';
import { OrdemServico } from '../ordens-servico/ordem-servico.entity';
import { ContaReceber } from '../contas-receber/conta-receber.entity';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { PermissoesGuardModule } from '../../common/guards/permissoes-guard.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cliente, OrdemServico, ContaReceber]),
    PermissoesGuardModule,
  ],
  providers: [ClientesService],
  controllers: [ClientesController],
  exports: [ClientesService],
})
export class ClientesModule {}
