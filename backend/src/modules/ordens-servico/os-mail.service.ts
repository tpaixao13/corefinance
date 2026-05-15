import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { OrdemServico, StatusOrdemServico } from './ordem-servico.entity';
import { Empresa } from '../empresas/empresa.entity';

const STATUS_PT: Record<StatusOrdemServico, string> = {
  [StatusOrdemServico.ABERTA]: 'Aberta',
  [StatusOrdemServico.EM_ANDAMENTO]: 'Em Andamento',
  [StatusOrdemServico.CONCLUIDA]: 'Concluída',
  [StatusOrdemServico.CANCELADA]: 'Cancelada',
};

@Injectable()
export class OsMailService {
  private readonly logger = new Logger(OsMailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get('MAIL_HOST', 'smtp.gmail.com'),
      port: config.get<number>('MAIL_PORT', 587),
      secure: config.get('MAIL_SECURE', 'false') === 'true',
      auth: {
        user: config.get('MAIL_USER'),
        pass: config.get('MAIL_PASS'),
      },
    });
  }

  gerarHtml(os: OrdemServico, empresa: Empresa): string {
    const fmtMoeda = (v: number) =>
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
    const fmtData = (d: string | null) =>
      d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '—';

    const logoHtml = empresa.logoUrl
      ? `<img src="${empresa.logoUrl}" alt="Logo" style="max-height:70px;max-width:200px;object-fit:contain;" />`
      : `<div style="font-size:22px;font-weight:bold;color:#0B2A4A;">${empresa.nome}</div>`;

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Ordem de Serviço</title>
  <style>
    body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
    .page { max-width: 800px; margin: 30px auto; background: #fff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
    .header { background: #0B2A4A; color: #fff; padding: 24px 32px; display: flex; align-items: center; justify-content: space-between; }
    .header-logo { }
    .header-title { text-align: right; }
    .header-title h1 { margin: 0; font-size: 20px; letter-spacing: 1px; }
    .header-title p { margin: 4px 0 0; font-size: 12px; opacity: 0.8; }
    .body { padding: 32px; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #888; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-bottom: 12px; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .field label { font-size: 11px; color: #888; display: block; margin-bottom: 2px; }
    .field p { font-size: 14px; font-weight: 500; color: #333; margin: 0; }
    .descricao-box { background: #f9f9f9; border: 1px solid #eee; border-radius: 6px; padding: 14px; font-size: 14px; line-height: 1.6; }
    .valor-box { font-size: 28px; font-weight: bold; color: #0B2A4A; text-align: right; margin-top: 8px; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; background: #e8f5e9; color: #2e7d32; }
    .footer { background: #f9f9f9; border-top: 1px solid #eee; padding: 16px 32px; font-size: 11px; color: #aaa; text-align: center; }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="header-logo">${logoHtml}</div>
      <div class="header-title">
        <h1>ORDEM DE SERVIÇO</h1>
        <p>Nº ${os.id.slice(0, 8).toUpperCase()}</p>
      </div>
    </div>

    <div class="body">
      <div class="section">
        <div class="section-title">Empresa Prestadora</div>
        <div class="grid2">
          <div class="field"><label>Razão Social</label><p>${empresa.nome}</p></div>
          <div class="field"><label>CNPJ</label><p>${empresa.cnpj}</p></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Cliente</div>
        <div class="grid2">
          <div class="field"><label>Nome</label><p>${os.cliente}</p></div>
          <div class="field"><label>E-mail</label><p>${os.emailCliente ?? '—'}</p></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Dados da Ordem</div>
        <div class="grid2">
          <div class="field"><label>Data de Abertura</label><p>${fmtData(os.dataAbertura)}</p></div>
          <div class="field"><label>Data de Conclusão</label><p>${fmtData(os.dataConclusao)}</p></div>
          <div class="field"><label>Status</label><p><span class="status-badge">${STATUS_PT[os.status]}</span></p></div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Descrição do Serviço</div>
        <div class="descricao-box">${os.descricao}</div>
      </div>

      <div class="valor-box">${fmtMoeda(Number(os.valor))}</div>
    </div>

    <div class="footer">
      Documento gerado automaticamente pelo sistema CoreFinance.
    </div>
  </div>
</body>
</html>`;
  }

  async enviar(para: string, os: OrdemServico, empresa: Empresa): Promise<void> {
    const html = this.gerarHtml(os, empresa);
    const from = this.config.get('MAIL_FROM', this.config.get('MAIL_USER', 'noreply@corefinance.com.br'));

    await this.transporter.sendMail({
      from: `"${empresa.nome}" <${from}>`,
      to: para,
      subject: `Ordem de Serviço Nº ${os.id.slice(0, 8).toUpperCase()} — ${empresa.nome}`,
      html,
    });

    this.logger.log(`Email OS ${os.id} enviado para ${para}`);
  }
}
