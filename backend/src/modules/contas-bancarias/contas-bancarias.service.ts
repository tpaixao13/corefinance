import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ContaBancaria } from './conta-bancaria.entity';
import { CreateContaBancariaDto } from './dto/create-conta-bancaria.dto';
import { UpdateContaBancariaDto } from './dto/update-conta-bancaria.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AcaoAuditoria } from '../auditoria/auditoria-log.entity';
import { Role } from '../usuarios/usuario.entity';

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

  async criar(dto: CreateContaBancariaDto, usuarioId: string, usuarioRole: Role, usuarioEmpresaId: string): Promise<ContaBancaria> {
    if (usuarioRole !== Role.SUPER_ADMIN && dto.empresaId !== usuarioEmpresaId) {
      throw new ForbiddenException('Acesso negado a esta empresa');
    }

    await this.verificarDuplicata(dto.empresaId, dto.banco, dto.agencia, dto.numero);

    const conta = this.contaRepo.create({
      ...dto,
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

  async atualizar(id: string, dto: UpdateContaBancariaDto, usuarioId: string, empresaId?: string): Promise<ContaBancaria> {
    const conta = await this.contaRepo.findOne({ where: { id } });
    if (!conta) throw new NotFoundException('Conta bancária não encontrada');
    if (empresaId && conta.empresaId !== empresaId) {
      throw new NotFoundException('Conta bancária não encontrada');
    }

    if (dto.banco || dto.agencia || dto.numero) {
      await this.verificarDuplicata(
        conta.empresaId,
        dto.banco ?? conta.banco,
        dto.agencia ?? conta.agencia,
        dto.numero ?? conta.numero,
        id,
      );
    }

    const dadosAntes = { banco: conta.banco, agencia: conta.agencia, numero: conta.numero, descricao: conta.descricao, ativo: conta.ativo };
    Object.assign(conta, dto);
    const salva = await this.contaRepo.save(conta);

    await this.auditoriaService.registrar({
      usuarioId,
      empresaId: salva.empresaId,
      acao: AcaoAuditoria.ATUALIZACAO_CONTA,
      entidade: 'conta_bancaria',
      entidadeId: salva.id,
      dadosAntes,
      dadosDepois: { banco: salva.banco, agencia: salva.agencia, numero: salva.numero, descricao: salva.descricao, ativo: salva.ativo },
    });

    return salva;
  }

  async listar(empresaId?: string): Promise<ContaBancaria[]> {
    const where = empresaId ? { empresaId } : {};
    return this.contaRepo.find({ where, order: { banco: 'ASC' } });
  }

  async buscarPorId(id: string, empresaId?: string): Promise<ContaBancaria> {
    const conta = await this.contaRepo.findOne({ where: { id } });
    if (!conta) throw new NotFoundException('Conta bancária não encontrada');
    if (empresaId && conta.empresaId !== empresaId) {
      throw new NotFoundException('Conta bancária não encontrada');
    }
    return conta;
  }

  /**
   * Recalcula saldo da conta baseado em todos os lançamentos de extrato.
   * Garante consistência ACID via transação.
   */
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
