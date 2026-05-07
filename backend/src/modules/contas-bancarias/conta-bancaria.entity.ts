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

@Entity('conta_bancaria')
export class ContaBancaria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => Empresa)
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ length: 100 })
  banco: string;

  @Column({ length: 20 })
  agencia: string;

  @Column({ length: 30 })
  numero: string;

  @Column({ length: 200, nullable: true })
  descricao: string;

  // Saldo inicial configurado no cadastro da conta
  @Column({ name: 'saldo_inicial', type: 'decimal', precision: 15, scale: 2, default: 0 })
  saldoInicial: number;

  // Saldo calculado: saldo_inicial + créditos - débitos (nunca editado diretamente)
  @Column({ name: 'saldo_atual', type: 'decimal', precision: 15, scale: 2, default: 0 })
  saldoAtual: number;

  @Column({ default: true })
  ativo: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
