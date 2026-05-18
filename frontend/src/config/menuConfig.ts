import {
  LayoutDashboard,
  Building2,
  Users,
  Landmark,
  UserRound,
  Receipt,
  TrendingUp,
  Upload,
  GitMerge,
  TrendingDown,
  FileText,
  Download,
  ClipboardList,
  Shield,
  ShieldCheck,
  BarChart2,
  type LucideIcon,
} from 'lucide-react';

export type Role = 'SUPER_ADMIN' | 'ADMIN_EMPRESA' | 'USUARIO';

export interface MenuItem {
  label: string;
  path: string;
  icon: LucideIcon;
  permissao?: string;
  roles?: Role[];
  end?: boolean;
}

export interface MenuGroup {
  id: string;
  label: string;
  defaultOpen: boolean;
  itens: MenuItem[];
}

/** Item fora de qualquer grupo — sempre no topo */
export const dashboardItem: MenuItem = {
  label: 'Dashboard',
  path: '/',
  icon: LayoutDashboard,
  permissao: 'DASHBOARD_VIEW',
  end: true,
};

export const menuGroups: MenuGroup[] = [
  {
    id: 'cadastros',
    label: 'Cadastros',
    defaultOpen: true,
    itens: [
      {
        label: 'Empresas',
        path: '/empresas',
        icon: Building2,
        roles: ['SUPER_ADMIN'],
      },
      {
        label: 'Usuários',
        path: '/usuarios',
        icon: Users,
        roles: ['SUPER_ADMIN', 'ADMIN_EMPRESA'],
      },
      {
        label: 'Contas Bancárias',
        path: '/contas',
        icon: Landmark,
        permissao: 'CONTA_BANCARIA_VIEW',
      },
      {
        label: 'Clientes',
        path: '/clientes',
        icon: UserRound,
        permissao: 'CLIENTE_VIEW',
      },
    ],
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    defaultOpen: true,
    itens: [
      {
        label: 'Contas a Pagar',
        path: '/contas-pagar',
        icon: Receipt,
        permissao: 'CONTAS_PAGAR_VIEW',
      },
      {
        label: 'Contas a Receber',
        path: '/contas-receber',
        icon: TrendingUp,
        permissao: 'CONTAS_RECEBER_VIEW',
      },
      {
        label: 'Importar Extrato',
        path: '/importar',
        icon: Upload,
        permissao: 'EXTRATO_IMPORT',
      },
      {
        label: 'Conciliação',
        path: '/conciliacao',
        icon: GitMerge,
        permissao: 'CONCILIACAO_EXECUTAR',
      },
      {
        label: 'Despesas',
        path: '/despesas',
        icon: TrendingDown,
        roles: ['SUPER_ADMIN', 'ADMIN_EMPRESA'],
      },
      {
        label: 'DRE',
        path: '/dre',
        icon: TrendingUp,
        roles: ['SUPER_ADMIN', 'ADMIN_EMPRESA'],
      },
      {
        label: 'Rel. Financeiro',
        path: '/relatorio-financeiro',
        icon: FileText,
        roles: ['SUPER_ADMIN', 'ADMIN_EMPRESA'],
      },
      {
        label: 'Exportação',
        path: '/exportacao',
        icon: Download,
        roles: ['SUPER_ADMIN', 'ADMIN_EMPRESA'],
      },
    ],
  },
  {
    id: 'operacional',
    label: 'Operacional',
    defaultOpen: true,
    itens: [
      {
        label: 'Ordens de Serviço',
        path: '/ordens-servico',
        icon: ClipboardList,
        permissao: 'ORDEM_SERVICO_VIEW',
      },
    ],
  },
  {
    id: 'administracao',
    label: 'Administração',
    defaultOpen: true,
    itens: [
      {
        label: 'Auditoria',
        path: '/auditoria',
        icon: Shield,
        permissao: 'AUDITORIA_VIEW',
        roles: ['SUPER_ADMIN', 'ADMIN_EMPRESA'],
      },
      {
        label: 'Permissões',
        path: '/permissoes',
        icon: ShieldCheck,
        roles: ['SUPER_ADMIN'],
      },
      {
        label: 'Relatórios (Admin)',
        path: '/relatorios',
        icon: BarChart2,
        roles: ['SUPER_ADMIN'],
      },
    ],
  },
];
