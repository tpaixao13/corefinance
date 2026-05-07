import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from './empresa.entity';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AcaoAuditoria } from '../auditoria/auditoria-log.entity';

@Injectable()
export class EmpresasService {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepo: Repository<Empresa>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async criar(dto: CreateEmpresaDto, usuarioId: string): Promise<Empresa> {
    const existe = await this.empresaRepo.findOne({ where: { cnpj: dto.cnpj } });
    if (existe) throw new ConflictException('CNPJ já cadastrado');

    const empresa = this.empresaRepo.create(dto);
    const salva = await this.empresaRepo.save(empresa);

    await this.auditoriaService.registrar({
      usuarioId,
      empresaId: salva.id,
      acao: AcaoAuditoria.CRIACAO_EMPRESA,
      entidade: 'empresa',
      entidadeId: salva.id,
      dadosDepois: { nome: salva.nome, cnpj: salva.cnpj },
    });

    return salva;
  }

  async listar(empresaId?: string): Promise<Empresa[]> {
    if (empresaId) {
      return this.empresaRepo.find({ where: { id: empresaId } });
    }
    return this.empresaRepo.find({ order: { nome: 'ASC' } });
  }

  async buscarPorId(id: string, empresaId?: string): Promise<Empresa> {
    const where: { id: string; } = { id };
    const empresa = await this.empresaRepo.findOne({ where });

    if (!empresa) throw new NotFoundException('Empresa não encontrada');
    if (empresaId && empresa.id !== empresaId) {
      throw new NotFoundException('Empresa não encontrada');
    }

    return empresa;
  }

  async atualizar(id: string, dto: UpdateEmpresaDto, usuarioId: string): Promise<Empresa> {
    const empresa = await this.buscarPorId(id);
    const dadosAntes = { nome: empresa.nome, cnpj: empresa.cnpj, ativo: empresa.ativo };

    Object.assign(empresa, dto);
    const atualizada = await this.empresaRepo.save(empresa);

    await this.auditoriaService.registrar({
      usuarioId,
      empresaId: id,
      acao: AcaoAuditoria.ATUALIZACAO_EMPRESA,
      entidade: 'empresa',
      entidadeId: id,
      dadosAntes,
      dadosDepois: { nome: atualizada.nome, cnpj: atualizada.cnpj, ativo: atualizada.ativo },
    });

    return atualizada;
  }
}
