import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Empresa } from '../empresas/empresa.entity';
import { Usuario } from '../usuarios/usuario.entity';

export enum AcaoAuditoria {
  IMPORTACAO_EXTRATO = 'IMPORTACAO_EXTRATO',
  CONCILIACAO_AUTOMATICA = 'CONCILIACAO_AUTOMATICA',
  CONCILIACAO_MANUAL = 'CONCILIACAO_MANUAL',
  AJUSTE_SALDO = 'AJUSTE_SALDO',
  CRIACAO_CONTA = 'CRIACAO_CONTA',
  ATUALIZACAO_CONTA = 'ATUALIZACAO_CONTA',
  CRIACAO_EMPRESA = 'CRIACAO_EMPRESA',
  ATUALIZACAO_EMPRESA = 'ATUALIZACAO_EMPRESA',
  CRIACAO_USUARIO = 'CRIACAO_USUARIO',
  LOGIN = 'LOGIN',
  ESTORNO_CONCILIACAO = 'ESTORNO_CONCILIACAO',
  ALTERACAO_PERMISSAO = 'ALTERACAO_PERMISSAO',
  SOLICITACAO_RESET_SENHA = 'SOLICITACAO_RESET_SENHA',
  RESET_SENHA = 'RESET_SENHA',
  INATIVACAO_CONTA = 'INATIVACAO_CONTA',
  ATIVACAO_CONTA = 'ATIVACAO_CONTA',
  CRIACAO_CONTA_PAGAR = 'CRIACAO_CONTA_PAGAR',
  EDICAO_CONTA_PAGAR = 'EDICAO_CONTA_PAGAR',
  CRIACAO_CONTA_RECEBER = 'CRIACAO_CONTA_RECEBER',
  EDICAO_CONTA_RECEBER = 'EDICAO_CONTA_RECEBER',
  ALTERACAO_LICENCA = 'ALTERACAO_LICENCA',
  TENTATIVA_LIMITE_USUARIOS = 'TENTATIVA_LIMITE_USUARIOS',
  CRIACAO_OS = 'CRIACAO_OS',
  EDICAO_OS = 'EDICAO_OS',
  FINALIZACAO_OS = 'FINALIZACAO_OS',
  CANCELAMENTO_OS = 'CANCELAMENTO_OS',
  ENVIO_EMAIL_OS = 'ENVIO_EMAIL_OS',
}

@Entity('auditoria_log')
export class AuditoriaLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'usuario_id', type: 'uuid', nullable: true })
  usuarioId: string;

  @ManyToOne(() => Usuario, { nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ name: 'empresa_id', type: 'uuid', nullable: true })
  empresaId: string;

  @ManyToOne(() => Empresa, { nullable: true })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ type: 'enum', enum: AcaoAuditoria })
  acao: AcaoAuditoria;

  @Column({ name: 'entidade', length: 100, nullable: true })
  entidade: string;

  @Column({ name: 'entidade_id', length: 100, nullable: true })
  entidadeId: string;

  // Snapshot antes da alteração (para UPDATE/DELETE)
  @Column({ name: 'dados_antes', type: 'jsonb', nullable: true })
  dadosAntes: Record<string, unknown>;

  // Snapshot depois da alteração
  @Column({ name: 'dados_depois', type: 'jsonb', nullable: true })
  dadosDepois: Record<string, unknown>;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
