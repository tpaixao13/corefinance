import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario, Role } from './usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AcaoAuditoria } from '../auditoria/auditoria-log.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async criar(dto: CreateUsuarioDto, criadorId: string, criadorRole: Role, criadorEmpresaId: string): Promise<Omit<Usuario, 'senhaHash'>> {
    // ADMIN_EMPRESA só pode criar usuários da própria empresa
    if (criadorRole === Role.ADMIN_EMPRESA) {
      if (dto.empresaId && dto.empresaId !== criadorEmpresaId) {
        throw new ForbiddenException('Não é possível criar usuários para outra empresa');
      }
      dto.empresaId = criadorEmpresaId;
    }

    const existe = await this.usuarioRepo.findOne({ where: { email: dto.email } });
    if (existe) throw new ConflictException('Email já cadastrado');

    const senhaHash = await bcrypt.hash(dto.senha, 12);
    const usuario = this.usuarioRepo.create({ ...dto, senhaHash });
    const salvo = await this.usuarioRepo.save(usuario);

    await this.auditoriaService.registrar({
      usuarioId: criadorId,
      empresaId: salvo.empresaId ?? undefined,
      acao: AcaoAuditoria.CRIACAO_USUARIO,
      entidade: 'usuario',
      entidadeId: salvo.id,
      dadosDepois: { nome: salvo.nome, email: salvo.email, role: salvo.role },
    });

    const { senhaHash: _, ...resultado } = salvo;
    return resultado;
  }

  async listar(usuarioAtual: { role: Role; empresaId: string }): Promise<Omit<Usuario, 'senhaHash'>[]> {
    const query = this.usuarioRepo.createQueryBuilder('u').select([
      'u.id', 'u.nome', 'u.email', 'u.role', 'u.ativo', 'u.empresaId', 'u.createdAt',
    ]);

    if (usuarioAtual.role !== Role.SUPER_ADMIN) {
      query.where('u.empresa_id = :empresaId', { empresaId: usuarioAtual.empresaId });
    }

    return query.getMany() as unknown as Omit<Usuario, 'senhaHash'>[];
  }

  async buscarPorId(id: string, empresaId?: string): Promise<Omit<Usuario, 'senhaHash'>> {
    const usuario = await this.usuarioRepo.findOne({ where: { id } });
    if (!usuario) throw new NotFoundException('Usuário não encontrado');

    if (empresaId && usuario.empresaId !== empresaId) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const { senhaHash: _, ...resultado } = usuario;
    return resultado;
  }

  async atualizar(id: string, dto: UpdateUsuarioDto, empresaId?: string): Promise<Omit<Usuario, 'senhaHash'>> {
    const usuario = await this.usuarioRepo.findOne({ where: { id } });
    if (!usuario) throw new NotFoundException('Usuário não encontrado');

    if (empresaId && usuario.empresaId !== empresaId) {
      throw new ForbiddenException('Acesso negado');
    }

    if (dto.senha) {
      (usuario as any).senhaHash = await bcrypt.hash(dto.senha, 12);
      delete (dto as any).senha;
    }

    Object.assign(usuario, dto);
    const atualizado = await this.usuarioRepo.save(usuario);

    const { senhaHash: _, ...resultado } = atualizado;
    return resultado;
  }
}
