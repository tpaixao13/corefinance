import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Usuario } from './usuario.entity';

export enum ChavePermissao {
  DASHBOARD_VIEW = 'DASHBOARD_VIEW',
  EXTRATO_IMPORT = 'EXTRATO_IMPORT',
  CONCILIACAO_EXECUTAR = 'CONCILIACAO_EXECUTAR',
  CONTAS_PAGAR_VIEW = 'CONTAS_PAGAR_VIEW',
  CONTAS_PAGAR_CREATE = 'CONTAS_PAGAR_CREATE',
  CONTAS_PAGAR_EDIT = 'CONTAS_PAGAR_EDIT',
  CONTAS_RECEBER_VIEW = 'CONTAS_RECEBER_VIEW',
  CONTAS_RECEBER_CREATE = 'CONTAS_RECEBER_CREATE',
  CONTAS_RECEBER_EDIT = 'CONTAS_RECEBER_EDIT',
  AUDITORIA_VIEW = 'AUDITORIA_VIEW',
  CONTA_BANCARIA_VIEW = 'CONTA_BANCARIA_VIEW',
  CONTA_BANCARIA_CREATE = 'CONTA_BANCARIA_CREATE',
  CONTA_BANCARIA_EDIT = 'CONTA_BANCARIA_EDIT',
  ORDEM_SERVICO_VIEW = 'ORDEM_SERVICO_VIEW',
  ORDEM_SERVICO_CREATE = 'ORDEM_SERVICO_CREATE',
  ORDEM_SERVICO_EDIT = 'ORDEM_SERVICO_EDIT',
  ORDEM_SERVICO_FINALIZAR = 'ORDEM_SERVICO_FINALIZAR',
  ORDEM_SERVICO_ENVIAR_EMAIL = 'ORDEM_SERVICO_ENVIAR_EMAIL',
  ORDEM_SERVICO_IMPRIMIR = 'ORDEM_SERVICO_IMPRIMIR',
}

export const PERMISSOES_DESCRICOES: Record<ChavePermissao, string> = {
  [ChavePermissao.DASHBOARD_VIEW]: 'Ver Dashboard',
  [ChavePermissao.EXTRATO_IMPORT]: 'Importar Extrato',
  [ChavePermissao.CONCILIACAO_EXECUTAR]: 'Executar Conciliação',
  [ChavePermissao.CONTAS_PAGAR_VIEW]: 'Ver Contas a Pagar',
  [ChavePermissao.CONTAS_PAGAR_CREATE]: 'Criar Contas a Pagar',
  [ChavePermissao.CONTAS_PAGAR_EDIT]: 'Editar Contas a Pagar',
  [ChavePermissao.CONTAS_RECEBER_VIEW]: 'Ver Contas a Receber',
  [ChavePermissao.CONTAS_RECEBER_CREATE]: 'Criar Contas a Receber',
  [ChavePermissao.CONTAS_RECEBER_EDIT]: 'Editar Contas a Receber',
  [ChavePermissao.AUDITORIA_VIEW]: 'Ver Auditoria',
  [ChavePermissao.CONTA_BANCARIA_VIEW]: 'Ver Contas Bancárias',
  [ChavePermissao.CONTA_BANCARIA_CREATE]: 'Criar Conta Bancária',
  [ChavePermissao.CONTA_BANCARIA_EDIT]: 'Editar Conta Bancária',
  [ChavePermissao.ORDEM_SERVICO_VIEW]: 'Ver Ordens de Serviço',
  [ChavePermissao.ORDEM_SERVICO_CREATE]: 'Criar Ordem de Serviço',
  [ChavePermissao.ORDEM_SERVICO_EDIT]: 'Editar/Cancelar OS',
  [ChavePermissao.ORDEM_SERVICO_FINALIZAR]: 'Finalizar Ordem de Serviço',
  [ChavePermissao.ORDEM_SERVICO_ENVIAR_EMAIL]: 'Enviar OS por E-mail',
  [ChavePermissao.ORDEM_SERVICO_IMPRIMIR]: 'Imprimir Ordem de Serviço',
};

export const PERMISSOES_GRUPOS: { label: string; chaves: ChavePermissao[] }[] = [
  {
    label: 'Visualização',
    chaves: [ChavePermissao.DASHBOARD_VIEW, ChavePermissao.AUDITORIA_VIEW],
  },
  {
    label: 'Extratos',
    chaves: [ChavePermissao.EXTRATO_IMPORT],
  },
  {
    label: 'Conciliação',
    chaves: [ChavePermissao.CONCILIACAO_EXECUTAR],
  },
  {
    label: 'Contas Bancárias',
    chaves: [ChavePermissao.CONTA_BANCARIA_VIEW, ChavePermissao.CONTA_BANCARIA_CREATE, ChavePermissao.CONTA_BANCARIA_EDIT],
  },
  {
    label: 'Contas a Pagar',
    chaves: [ChavePermissao.CONTAS_PAGAR_VIEW, ChavePermissao.CONTAS_PAGAR_CREATE, ChavePermissao.CONTAS_PAGAR_EDIT],
  },
  {
    label: 'Contas a Receber',
    chaves: [ChavePermissao.CONTAS_RECEBER_VIEW, ChavePermissao.CONTAS_RECEBER_CREATE, ChavePermissao.CONTAS_RECEBER_EDIT],
  },
  {
    label: 'Ordens de Serviço',
    chaves: [
      ChavePermissao.ORDEM_SERVICO_VIEW,
      ChavePermissao.ORDEM_SERVICO_CREATE,
      ChavePermissao.ORDEM_SERVICO_EDIT,
      ChavePermissao.ORDEM_SERVICO_FINALIZAR,
      ChavePermissao.ORDEM_SERVICO_ENVIAR_EMAIL,
      ChavePermissao.ORDEM_SERVICO_IMPRIMIR,
    ],
  },
];

@Entity('usuario_permissao')
@Unique(['usuarioId', 'chave'])
export class UsuarioPermissao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'usuario_id', type: 'uuid' })
  usuarioId: string;

  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({ length: 100 })
  chave: string;

  @Column({ default: false })
  habilitado: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
