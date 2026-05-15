import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Empresa } from '../empresas/empresa.entity';
import { RecorrenciaContaPagar } from '../contas-pagar/conta-pagar.entity';

export enum StatusContaReceber {
  ABERTA = 'ABERTA',
  RECEBIDA = 'RECEBIDA',
  CANCELADA = 'CANCELADA',
}

@Entity('conta_receber')
export class ContaReceber {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ length: 300 })
  descricao: string;

  @Column({ length: 200, nullable: true })
  cliente: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  valor: number;

  @Column({ name: 'data_recebimento', type: 'date' })
  dataRecebimento: string;

  @Column({
    type: 'enum',
    enum: RecorrenciaContaPagar,
    default: RecorrenciaContaPagar.NENHUMA,
  })
  recorrencia: RecorrenciaContaPagar;

  @Column({
    type: 'enum',
    enum: StatusContaReceber,
    default: StatusContaReceber.ABERTA,
  })
  status: StatusContaReceber;

  @Column({ name: 'cliente_id', type: 'uuid', nullable: true })
  clienteId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
