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
import { Usuario } from '../usuarios/usuario.entity';

export enum FormatoExtrato {
  OFX = 'OFX',
  CSV = 'CSV',
  XLSX = 'XLSX',
}

@Entity('extrato_importacao')
export class ExtratoImportacao {
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

  @Column({ name: 'usuario_id', type: 'uuid' })
  usuarioId: string;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ name: 'nome_arquivo', length: 255 })
  nomeArquivo: string;

  @Column({ type: 'enum', enum: FormatoExtrato })
  formato: FormatoExtrato;

  // SHA256 do arquivo — impede importação duplicada
  @Column({ name: 'hash_arquivo', length: 64, unique: true })
  hashArquivo: string;

  @Column({ name: 'periodo_inicio', type: 'date', nullable: true })
  periodoInicio: Date;

  @Column({ name: 'periodo_fim', type: 'date', nullable: true })
  periodoFim: Date;

  @Column({ name: 'total_lancamentos', default: 0 })
  totalLancamentos: number;

  @CreateDateColumn({ name: 'data_importacao' })
  dataImportacao: Date;
}
