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

export enum StatusOrdemServico {
  ABERTA = 'ABERTA',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDA = 'CONCLUIDA',
  CANCELADA = 'CANCELADA',
}

@Entity('ordem_servico')
export class OrdemServico {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ length: 200 })
  cliente: string;

  @Column({ length: 1000 })
  descricao: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  valor: number;

  @Column({
    type: 'enum',
    enum: StatusOrdemServico,
    default: StatusOrdemServico.ABERTA,
  })
  status: StatusOrdemServico;

  @Column({ name: 'data_abertura', type: 'date' })
  dataAbertura: string;

  @Column({ name: 'data_conclusao', type: 'date', nullable: true })
  dataConclusao: string | null;

  @Column({ name: 'conta_receber_id', type: 'uuid', nullable: true })
  contaReceberId: string | null;

  @Column({ name: 'cliente_id', type: 'uuid', nullable: true })
  clienteId: string | null;

  @Column({ name: 'email_cliente', type: 'varchar', length: 200, nullable: true })
  emailCliente: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
