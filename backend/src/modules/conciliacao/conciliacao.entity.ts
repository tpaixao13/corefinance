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
import { ContaBancaria } from '../contas-bancarias/conta-bancaria.entity';
import { ExtratoLancamento } from '../extratos/extrato-lancamento.entity';
import { Usuario } from '../usuarios/usuario.entity';

export enum TipoConciliacao {
  AUTOMATICA = 'AUTOMATICA',
  MANUAL = 'MANUAL',
}

export enum StatusConciliacaoRegistro {
  CONCILIADO = 'CONCILIADO',
  ESTORNADO = 'ESTORNADO',
}

@Entity('conciliacao')
export class Conciliacao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ name: 'conta_id', type: 'uuid' })
  contaId: string;

  @ManyToOne(() => ContaBancaria)
  @JoinColumn({ name: 'conta_id' })
  conta: ContaBancaria;

  @Column({ name: 'lancamento_extrato_id', type: 'uuid' })
  lancamentoExtratoId: string;

  @ManyToOne(() => ExtratoLancamento)
  @JoinColumn({ name: 'lancamento_extrato_id' })
  lancamentoExtrato: ExtratoLancamento;

  @Column({ type: 'enum', enum: TipoConciliacao })
  tipo: TipoConciliacao;

  @Column({
    type: 'enum',
    enum: StatusConciliacaoRegistro,
    default: StatusConciliacaoRegistro.CONCILIADO,
  })
  status: StatusConciliacaoRegistro;

  @Column({ length: 500, nullable: true })
  observacao: string;

  @Column({ name: 'usuario_id', type: 'uuid', nullable: true })
  usuarioId: string;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
