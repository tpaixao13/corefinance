import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContaReceber, StatusContaReceber } from './conta-receber.entity';
import { CreateContaReceberDto } from './dto/create-conta-receber.dto';
import { UpdateContaReceberDto } from './dto/update-conta-receber.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AcaoAuditoria } from '../auditoria/auditoria-log.entity';

@Injectable()
export class ContasReceberService {
  constructor(
    @InjectRepository(ContaReceber)
    private readonly repo: Repository<ContaReceber>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async criar(dto: CreateContaReceberDto, empresaId: string, operadorId: string): Promise<ContaReceber> {
    const conta = this.repo.create({ ...dto, empresaId });
    const salva = await this.repo.save(conta);

    this.auditoriaService.registrar({
      usuarioId: operadorId,
      empresaId,
      acao: AcaoAuditoria.CRIACAO_CONTA_RECEBER,
      entidade: 'conta_receber',
      entidadeId: salva.id,
      dadosDepois: { descricao: salva.descricao, valor: salva.valor, dataRecebimento: salva.dataRecebimento },
    }).catch((err) => console.error('[auditoria] CRIACAO_CONTA_RECEBER falhou:', err));

    return salva;
  }

  async listar(empresaId: string, page = 1, limit = 50) {
    const [data, total] = await this.repo.findAndCount({
      where: { empresaId },
      order: { dataRecebimento: 'ASC', createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async buscarPorId(id: string, empresaId: string): Promise<ContaReceber> {
    const conta = await this.repo.findOne({ where: { id, empresaId } });
    if (!conta) throw new NotFoundException('Conta a receber não encontrada');
    return conta;
  }

  async atualizar(id: string, dto: UpdateContaReceberDto, empresaId: string, operadorId: string): Promise<ContaReceber> {
    const conta = await this.buscarPorId(id, empresaId);

    if (conta.status === StatusContaReceber.RECEBIDA) {
      throw new BadRequestException('Conta já recebida via conciliação. Edição bloqueada.');
    }

    if (dto.status === StatusContaReceber.RECEBIDA) {
      throw new BadRequestException('Status RECEBIDA só pode ser definido via conciliação bancária');
    }

    const antes = { descricao: conta.descricao, valor: conta.valor, status: conta.status };
    Object.assign(conta, dto);
    const atualizada = await this.repo.save(conta);

    this.auditoriaService.registrar({
      usuarioId: operadorId,
      empresaId,
      acao: AcaoAuditoria.EDICAO_CONTA_RECEBER,
      entidade: 'conta_receber',
      entidadeId: atualizada.id,
      dadosAntes: antes,
      dadosDepois: { descricao: atualizada.descricao, valor: atualizada.valor, status: atualizada.status },
    }).catch((err) => console.error('[auditoria] EDICAO_CONTA_RECEBER falhou:', err));

    return atualizada;
  }

  async marcarComoRecebida(id: string, empresaId: string): Promise<ContaReceber> {
    const conta = await this.buscarPorId(id, empresaId);
    if (conta.status === StatusContaReceber.RECEBIDA) {
      throw new BadRequestException('Conta já marcada como recebida');
    }
    conta.status = StatusContaReceber.RECEBIDA;
    return this.repo.save(conta);
  }
}
