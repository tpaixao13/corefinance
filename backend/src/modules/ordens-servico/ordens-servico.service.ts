import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdemServico, StatusOrdemServico } from './ordem-servico.entity';
import { CreateOrdemServicoDto } from './dto/create-ordem-servico.dto';
import { UpdateOrdemServicoDto } from './dto/update-ordem-servico.dto';
import { ContasReceberService } from '../contas-receber/contas-receber.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AcaoAuditoria } from '../auditoria/auditoria-log.entity';
import { OsMailService } from './os-mail.service';
import { Empresa } from '../empresas/empresa.entity';

@Injectable()
export class OrdensServicoService {
  constructor(
    @InjectRepository(OrdemServico)
    private readonly repo: Repository<OrdemServico>,
    @InjectRepository(Empresa)
    private readonly empresaRepo: Repository<Empresa>,
    private readonly contasReceberService: ContasReceberService,
    private readonly auditoriaService: AuditoriaService,
    private readonly mailService: OsMailService,
  ) {}

  async criar(dto: CreateOrdemServicoDto, empresaId: string, operadorId: string): Promise<OrdemServico> {
    const os = this.repo.create({ ...dto, empresaId });
    const salva = await this.repo.save(os);

    this.auditoriaService.registrar({
      usuarioId: operadorId,
      empresaId,
      acao: AcaoAuditoria.CRIACAO_OS,
      entidade: 'ordem_servico',
      entidadeId: salva.id,
      dadosDepois: { cliente: salva.cliente, descricao: salva.descricao, valor: salva.valor, status: salva.status },
    }).catch((err) => console.error('[auditoria] CRIACAO_OS falhou:', err));

    return salva;
  }

  async listar(empresaId: string, page = 1, limit = 50) {
    const [data, total] = await this.repo.findAndCount({
      where: { empresaId },
      order: { dataAbertura: 'DESC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async buscarPorId(id: string, empresaId: string): Promise<OrdemServico> {
    const os = await this.repo.findOne({ where: { id, empresaId } });
    if (!os) throw new NotFoundException('Ordem de serviço não encontrada');
    return os;
  }

  async atualizar(id: string, dto: UpdateOrdemServicoDto, empresaId: string, operadorId: string): Promise<OrdemServico> {
    const os = await this.buscarPorId(id, empresaId);

    if (os.status === StatusOrdemServico.CONCLUIDA || os.status === StatusOrdemServico.CANCELADA) {
      throw new ForbiddenException(`Ordem de serviço ${os.status.toLowerCase()} não pode ser editada`);
    }

    const antes = { cliente: os.cliente, descricao: os.descricao, valor: os.valor, status: os.status };
    Object.assign(os, dto);
    const atualizada = await this.repo.save(os);

    this.auditoriaService.registrar({
      usuarioId: operadorId,
      empresaId,
      acao: AcaoAuditoria.EDICAO_OS,
      entidade: 'ordem_servico',
      entidadeId: atualizada.id,
      dadosAntes: antes,
      dadosDepois: { cliente: atualizada.cliente, descricao: atualizada.descricao, valor: atualizada.valor, status: atualizada.status },
    }).catch((err) => console.error('[auditoria] EDICAO_OS falhou:', err));

    return atualizada;
  }

  async finalizar(id: string, dataConclusao: string, empresaId: string, operadorId: string): Promise<OrdemServico> {
    const os = await this.buscarPorId(id, empresaId);

    if (os.status === StatusOrdemServico.CONCLUIDA) {
      throw new BadRequestException('Ordem de serviço já foi concluída');
    }
    if (os.status === StatusOrdemServico.CANCELADA) {
      throw new BadRequestException('Ordem de serviço cancelada não pode ser concluída');
    }
    if (os.contaReceberId) {
      throw new BadRequestException('Conta a receber já foi gerada para esta OS');
    }

    const contaReceber = await this.contasReceberService.criar(
      {
        descricao: `OS #${os.id.slice(0, 8).toUpperCase()} — ${os.cliente}: ${os.descricao}`,
        cliente: os.cliente,
        valor: Number(os.valor),
        dataRecebimento: dataConclusao,
      },
      empresaId,
      operadorId,
    );

    os.status = StatusOrdemServico.CONCLUIDA;
    os.dataConclusao = dataConclusao;
    os.contaReceberId = contaReceber.id;
    const concluida = await this.repo.save(os);

    this.auditoriaService.registrar({
      usuarioId: operadorId,
      empresaId,
      acao: AcaoAuditoria.FINALIZACAO_OS,
      entidade: 'ordem_servico',
      entidadeId: concluida.id,
      dadosDepois: { status: concluida.status, dataConclusao, contaReceberId: contaReceber.id },
    }).catch((err) => console.error('[auditoria] FINALIZACAO_OS falhou:', err));

    return concluida;
  }

  async cancelar(id: string, empresaId: string, operadorId: string): Promise<OrdemServico> {
    const os = await this.buscarPorId(id, empresaId);

    if (os.status === StatusOrdemServico.CONCLUIDA) {
      throw new BadRequestException('Ordem de serviço concluída não pode ser cancelada');
    }
    if (os.status === StatusOrdemServico.CANCELADA) {
      throw new BadRequestException('Ordem de serviço já foi cancelada');
    }

    os.status = StatusOrdemServico.CANCELADA;
    const cancelada = await this.repo.save(os);

    this.auditoriaService.registrar({
      usuarioId: operadorId,
      empresaId,
      acao: AcaoAuditoria.CANCELAMENTO_OS,
      entidade: 'ordem_servico',
      entidadeId: cancelada.id,
      dadosDepois: { status: cancelada.status },
    }).catch((err) => console.error('[auditoria] CANCELAMENTO_OS falhou:', err));

    return cancelada;
  }

  async enviarEmail(id: string, emailDestino: string | null, empresaId: string, operadorId: string): Promise<{ enviado: boolean; para: string }> {
    const os = await this.buscarPorId(id, empresaId);
    const empresa = await this.empresaRepo.findOne({ where: { id: empresaId } });
    if (!empresa) throw new NotFoundException('Empresa não encontrada');

    const para = emailDestino || os.emailCliente;
    if (!para) {
      throw new BadRequestException('E-mail do destinatário não encontrado. Informe um e-mail ou cadastre um cliente com e-mail.');
    }

    await this.mailService.enviar(para, os, empresa);

    this.auditoriaService.registrar({
      usuarioId: operadorId,
      empresaId,
      acao: AcaoAuditoria.ENVIO_EMAIL_OS,
      entidade: 'ordem_servico',
      entidadeId: os.id,
      dadosDepois: { emailDestino: para },
    }).catch((err) => console.error('[auditoria] ENVIO_EMAIL_OS falhou:', err));

    return { enviado: true, para };
  }
}
