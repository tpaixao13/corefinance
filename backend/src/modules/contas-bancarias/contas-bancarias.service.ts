import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ContaBancaria } from './conta-bancaria.entity';
import { CreateContaBancariaDto } from './dto/create-conta-bancaria.dto';
import { UpdateContaBancariaDto } from './dto/update-conta-bancaria.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AcaoAuditoria } from '../auditoria/auditoria-log.entity';

export type ContaBancariaComMov = ContaBancaria & { temMovimentacoes: boolean };

@Injectable()
export class ContasBancariasService {
  constructor(
    @InjectRepository(ContaBancaria)
    private readonly contaRepo: Repository<ContaBancaria>,
    private readonly dataSource: DataSource,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  private async verificarDuplicata(empresaId: string, banco: string, agencia: string, numero: string, ignorarId?: string): Promise<void> {
    const existente = await this.contaRepo.findOne({
      where: { empresaId, banco, agencia, numero },
    });
    if (existente && existente.id !== ignorarId) {
      throw new ConflictException('Já existe uma conta com este banco, agência e número para esta empresa');
    }
  }

  private async temMovimentacoes(contaId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `SELECT COUNT(*) as count FROM extrato_lancamento WHERE conta_id = $1`,
      [contaId],
    );
    return parseInt(result[0].count) > 0;
  }

  async criar(dto: CreateContaBancariaDto, usuarioId: string, empresaId: string): Promise<ContaBancaria> {
    await this.verificarDuplicata(empresaId, dto.banco, dto.agencia, dto.numero);

    const conta = this.contaRepo.create({
      ...dto,
      empresaId,
      saldoAtual: dto.saldoInicial ?? 0,
    });
    const salva = await this.contaRepo.save(conta);

    await this.auditoriaService.registrar({
      usuarioId,
      empresaId: salva.empresaId,
      acao: AcaoAuditoria.CRIACAO_CONTA,
      entidade: 'conta_bancaria',
      entidadeId: salva.id,
      dadosDepois: { banco: salva.banco, agencia: salva.agencia, numero: salva.numero, saldoInicial: salva.saldoInicial },
    });

    return salva;
  }

  async listar(empresaId?: string): Promise<ContaBancariaComMov[]> {
    const where = empresaId ? { empresaId } : {};
    const contas = await this.contaRepo.find({ where, order: { banco: 'ASC' } });

    if (contas.length === 0) return [];

    const ids = contas.map(c => c.id);
    const comMov: { conta_id: string }[] = await this.dataSource.query(
      `SELECT DISTINCT conta_id FROM extrato_lancamento WHERE conta_id = ANY($1)`,
      [ids],
    );
    const idsComMov = new Set(comMov.map(r => r.conta_id));

    return contas.map(c => Object.assign(c, { temMovimentacoes: idsComMov.has(c.id) }));
  }

  async buscarPorId(id: string, empresaId?: string): Promise<ContaBancariaComMov> {
    const conta = await this.contaRepo.findOne({ where: { id } });
    if (!conta) throw new NotFoundException('Conta bancária não encontrada');
    if (empresaId && conta.empresaId !== empresaId) {
      throw new NotFoundException('Conta bancária não encontrada');
    }
    const mov = await this.temMovimentacoes(id);
    return Object.assign(conta, { temMovimentacoes: mov });
  }

  async atualizar(id: string, dto: UpdateContaBancariaDto, usuarioId: string, empresaId?: string): Promise<ContaBancaria> {
    const conta = await this.contaRepo.findOne({ where: { id } });
    if (!conta) throw new NotFoundException('Conta bancária não encontrada');
    if (empresaId && conta.empresaId !== empresaId) {
      throw new NotFoundException('Conta bancária não encontrada');
    }

    const mov = await this.temMovimentacoes(id);
    if (mov && (dto.banco !== undefined || dto.agencia !== undefined || dto.numero !== undefined)) {
      throw new ConflictException('Conta com movimentações financeiras não permite alteração de banco, agência ou número');
    }

    if (!mov && (dto.banco || dto.agencia || dto.numero)) {
      await this.verificarDuplicata(
        conta.empresaId,
        dto.banco ?? conta.banco,
        dto.agencia ?? conta.agencia,
        dto.numero ?? conta.numero,
        id,
      );
    }

    const dadosAntes = { banco: conta.banco, agencia: conta.agencia, numero: conta.numero, descricao: conta.descricao };
    Object.assign(conta, dto);
    const salva = await this.contaRepo.save(conta);

    await this.auditoriaService.registrar({
      usuarioId,
      empresaId: salva.empresaId,
      acao: AcaoAuditoria.ATUALIZACAO_CONTA,
      entidade: 'conta_bancaria',
      entidadeId: salva.id,
      dadosAntes,
      dadosDepois: { banco: salva.banco, agencia: salva.agencia, numero: salva.numero, descricao: salva.descricao },
    });

    return salva;
  }

  async inativar(id: string, usuarioId: string, empresaId?: string): Promise<ContaBancaria> {
    const conta = await this.contaRepo.findOne({ where: { id } });
    if (!conta) throw new NotFoundException('Conta bancária não encontrada');
    if (empresaId && conta.empresaId !== empresaId) {
      throw new NotFoundException('Conta bancária não encontrada');
    }

    await this.contaRepo.update(id, { ativo: false });

    await this.auditoriaService.registrar({
      usuarioId,
      empresaId: conta.empresaId,
      acao: AcaoAuditoria.INATIVACAO_CONTA,
      entidade: 'conta_bancaria',
      entidadeId: id,
      dadosAntes: { ativo: true },
      dadosDepois: { ativo: false },
    });

    return { ...conta, ativo: false };
  }

  async ativar(id: string, usuarioId: string, empresaId?: string): Promise<ContaBancaria> {
    const conta = await this.contaRepo.findOne({ where: { id } });
    if (!conta) throw new NotFoundException('Conta bancária não encontrada');
    if (empresaId && conta.empresaId !== empresaId) {
      throw new NotFoundException('Conta bancária não encontrada');
    }

    await this.contaRepo.update(id, { ativo: true });

    await this.auditoriaService.registrar({
      usuarioId,
      empresaId: conta.empresaId,
      acao: AcaoAuditoria.ATIVACAO_CONTA,
      entidade: 'conta_bancaria',
      entidadeId: id,
      dadosAntes: { ativo: false },
      dadosDepois: { ativo: true },
    });

    return { ...conta, ativo: true };
  }

  async recalcularSaldo(contaId: string): Promise<{ saldoCalculado: number; diferenca: number }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const conta = await queryRunner.manager.findOne(ContaBancaria, {
        where: { id: contaId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!conta) throw new NotFoundException('Conta não encontrada');

      const resultado = await queryRunner.manager.query(
        `SELECT
          COALESCE(SUM(CASE WHEN tipo = 'CREDITO' THEN valor ELSE 0 END), 0) as total_creditos,
          COALESCE(SUM(CASE WHEN tipo = 'DEBITO' THEN valor ELSE 0 END), 0) as total_debitos
        FROM extrato_lancamento
        WHERE conta_id = $1`,
        [contaId],
      );

      const { total_creditos, total_debitos } = resultado[0];
      const saldoCalculado = Number(conta.saldoInicial) + Number(total_creditos) - Number(total_debitos);
      const diferenca = saldoCalculado - Number(conta.saldoAtual);

      await queryRunner.manager.update(ContaBancaria, contaId, { saldoAtual: saldoCalculado });
      await queryRunner.commitTransaction();

      return { saldoCalculado, diferenca };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
