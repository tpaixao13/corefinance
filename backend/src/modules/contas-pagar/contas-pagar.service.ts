import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContaPagar, StatusContaPagar } from './conta-pagar.entity';
import { CreateContaPagarDto } from './dto/create-conta-pagar.dto';
import { UpdateContaPagarDto } from './dto/update-conta-pagar.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AcaoAuditoria } from '../auditoria/auditoria-log.entity';

@Injectable()
export class ContasPagarService {
  constructor(
    @InjectRepository(ContaPagar)
    private readonly repo: Repository<ContaPagar>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async criar(dto: CreateContaPagarDto, empresaId: string, operadorId: string): Promise<ContaPagar> {
    const conta = this.repo.create({ ...dto, empresaId });
    const salva = await this.repo.save(conta);

    this.auditoriaService.registrar({
      usuarioId: operadorId,
      empresaId,
      acao: AcaoAuditoria.CRIACAO_CONTA_PAGAR,
      entidade: 'conta_pagar',
      entidadeId: salva.id,
      dadosDepois: { descricao: salva.descricao, valor: salva.valor, dataVencimento: salva.dataVencimento },
    }).catch((err) => console.error('[auditoria] CRIACAO_CONTA_PAGAR falhou:', err));

    return salva;
  }

  async listar(empresaId: string, page = 1, limit = 50) {
    const [data, total] = await this.repo.findAndCount({
      where: { empresaId },
      order: { dataVencimento: 'ASC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async buscarPorId(id: string, empresaId: string): Promise<ContaPagar> {
    const conta = await this.repo.findOne({ where: { id, empresaId } });
    if (!conta) throw new NotFoundException('Conta a pagar não encontrada');
    return conta;
  }

  async atualizar(id: string, dto: UpdateContaPagarDto, empresaId: string, operadorId: string): Promise<ContaPagar> {
    const conta = await this.buscarPorId(id, empresaId);

    if (conta.status === StatusContaPagar.PAGA) {
      throw new BadRequestException('Conta já paga via conciliação. Edição bloqueada.');
    }

    if (dto.status === StatusContaPagar.PAGA) {
      throw new BadRequestException('Status PAGA só pode ser definido via conciliação bancária');
    }

    const antes = { descricao: conta.descricao, valor: conta.valor, status: conta.status };
    Object.assign(conta, dto);
    const atualizada = await this.repo.save(conta);

    this.auditoriaService.registrar({
      usuarioId: operadorId,
      empresaId,
      acao: AcaoAuditoria.EDICAO_CONTA_PAGAR,
      entidade: 'conta_pagar',
      entidadeId: atualizada.id,
      dadosAntes: antes,
      dadosDepois: { descricao: atualizada.descricao, valor: atualizada.valor, status: atualizada.status },
    }).catch((err) => console.error('[auditoria] EDICAO_CONTA_PAGAR falhou:', err));

    return atualizada;
  }

  async marcarComoPaga(id: string, empresaId: string): Promise<ContaPagar> {
    const conta = await this.buscarPorId(id, empresaId);
    if (conta.status === StatusContaPagar.PAGA) {
      throw new BadRequestException('Conta já marcada como paga');
    }
    conta.status = StatusContaPagar.PAGA;
    return this.repo.save(conta);
  }
}
