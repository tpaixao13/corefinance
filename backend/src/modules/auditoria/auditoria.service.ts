import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditoriaLog, AcaoAuditoria } from './auditoria-log.entity';

interface RegistrarAuditoriaDto {
  usuarioId?: string;
  empresaId?: string;
  acao: AcaoAuditoria;
  entidade?: string;
  entidadeId?: string;
  dadosAntes?: Record<string, unknown>;
  dadosDepois?: Record<string, unknown>;
  ipAddress?: string;
}

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(AuditoriaLog)
    private readonly auditoriaRepo: Repository<AuditoriaLog>,
  ) {}

  async registrar(dto: RegistrarAuditoriaDto): Promise<void> {
    const log = this.auditoriaRepo.create({
      usuarioId: dto.usuarioId,
      empresaId: dto.empresaId,
      acao: dto.acao,
      entidade: dto.entidade,
      entidadeId: dto.entidadeId,
      dadosAntes: dto.dadosAntes,
      dadosDepois: dto.dadosDepois,
      ipAddress: dto.ipAddress,
    });

    await this.auditoriaRepo.save(log);
  }

  async listar(empresaId?: string, page = 1, limit = 50, acao?: string) {
    const query = this.auditoriaRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.usuario', 'u')
      .orderBy('a.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (empresaId) {
      query.where('a.empresa_id = :empresaId', { empresaId });
    }

    if (acao) {
      query.andWhere('a.acao = :acao', { acao });
    }

    const [data, total] = await query.getManyAndCount();
    return { data, total, page, limit };
  }
}
