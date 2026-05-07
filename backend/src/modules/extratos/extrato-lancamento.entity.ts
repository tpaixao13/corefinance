import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Empresa } from '../empresas/empresa.entity';
import { ContaBancaria } from '../contas-bancarias/conta-bancaria.entity';
import { ExtratoImportacao } from './extrato-importacao.entity';

export enum TipoLancamento {
  CREDITO = 'CREDITO',
  DEBITO = 'DEBITO',
}

export enum StatusConciliacao {
  CONCILIADO = 'CONCILIADO',
  PENDENTE = 'PENDENTE',
  NAO_ENCONTRADO = 'NAO_ENCONTRADO',
}

@Entity('extrato_lancamento')
export class ExtratoLancamento {
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

  @Column({ name: 'importacao_id', type: 'uuid' })
  importacaoId: string;

  @ManyToOne(() => ExtratoImportacao)
  @JoinColumn({ name: 'importacao_id' })
  importacao: ExtratoImportacao;

  // ID original do lançamento no arquivo OFX (FITID)
  @Column({ name: 'id_externo', length: 100, nullable: true })
  idExterno: string;

  @Column({ type: 'date' })
  data: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  valor: number;

  @Column({ length: 500, nullable: true })
  descricao: string;

  @Column({ type: 'enum', enum: TipoLancamento })
  tipo: TipoLancamento;

  // Saldo do extrato bancário no momento do lançamento
  @Column({ name: 'saldo_extrato', type: 'decimal', precision: 15, scale: 2, nullable: true })
  saldoExtrato: number;

  @Column({
    name: 'status_conciliacao',
    type: 'enum',
    enum: StatusConciliacao,
    default: StatusConciliacao.PENDENTE,
  })
  statusConciliacao: StatusConciliacao;

  @Column({ name: 'conciliacao_id', type: 'uuid', nullable: true })
  conciliacaoId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
