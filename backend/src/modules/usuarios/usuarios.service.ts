import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario, Role } from './usuario.entity';
import {
  UsuarioPermissao,
  ChavePermissao,
  PERMISSOES_DESCRICOES,
} from './usuario-permissao.entity';
import { Empresa } from '../empresas/empresa.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { UpdatePermissaoDto } from './dto/update-permissao.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AcaoAuditoria } from '../auditoria/auditoria-log.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(UsuarioPermissao)
    private readonly permissaoRepo: Repository<UsuarioPermissao>,
    @InjectRepository(Empresa)
    private readonly empresaRepo: Repository<Empresa>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async criar(dto: CreateUsuarioDto, criadorId: string, criadorRole: Role, criadorEmpresaId: string): Promise<Omit<Usuario, 'senhaHash'>> {
    // ADMIN_EMPRESA só pode criar usuários da própria empresa
    if (criadorRole === Role.ADMIN_EMPRESA) {
      if (dto.empresaId && dto.empresaId !== criadorEmpresaId) {
        throw new ForbiddenException('Não é possível criar usuários para outra empresa');
      }
      dto.empresaId = criadorEmpresaId;

      const empresa = await this.empresaRepo.findOne({ where: { id: criadorEmpresaId } });
      if (empresa) {
        const ativos = await this.usuarioRepo.count({ where: { empresaId: criadorEmpresaId, ativo: true } });
        if (ativos >= empresa.maxUsuarios) {
          this.auditoriaService.registrar({
            usuarioId: criadorId,
            empresaId: criadorEmpresaId,
            acao: AcaoAuditoria.TENTATIVA_LIMITE_USUARIOS,
            entidade: 'usuario',
            dadosAntes: { usuariosAtivos: ativos, maxUsuarios: empresa.maxUsuarios },
          }).catch(err => console.error('Audit TENTATIVA_LIMITE_USUARIOS error:', err));
          throw new ForbiddenException(`Limite de ${empresa.maxUsuarios} usuário(s) ativo(s) atingido para esta empresa`);
        }
      }
    }

    const existe = await this.usuarioRepo.findOne({ where: { email: dto.email } });
    if (existe) throw new ConflictException('Email já cadastrado');

    const senhaHash = await bcrypt.hash(dto.senha, 12);
    const usuario = this.usuarioRepo.create({ ...dto, senhaHash });
    const salvo = await this.usuarioRepo.save(usuario);

    if (salvo.role === Role.ADMIN_EMPRESA) {
      const permissoesPadrao = [ChavePermissao.DASHBOARD_VIEW, ChavePermissao.CONTA_BANCARIA_VIEW];
      await this.permissaoRepo.save(
        permissoesPadrao.map((chave) => this.permissaoRepo.create({ usuarioId: salvo.id, chave, habilitado: true })),
      );
    }

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

  async listar(usuarioAtual: { role: Role; empresaId: string }, headerEmpresaId?: string): Promise<Omit<Usuario, 'senhaHash'>[]> {
    const query = this.usuarioRepo.createQueryBuilder('u').select([
      'u.id', 'u.nome', 'u.email', 'u.role', 'u.ativo', 'u.empresaId', 'u.createdAt',
    ]);

    if (usuarioAtual.role !== Role.SUPER_ADMIN) {
      query.where('u.empresa_id = :empresaId', { empresaId: usuarioAtual.empresaId });
    } else if (headerEmpresaId) {
      query.where('u.empresa_id = :empresaId', { empresaId: headerEmpresaId });
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

  async listarComPermissoes() {
    const usuarios = await this.usuarioRepo.find({
      relations: ['empresa'],
      order: { nome: 'ASC' },
    });

    const ids = usuarios.map((u) => u.id);
    const todasPermissoes = ids.length
      ? await this.permissaoRepo.find({ where: { usuarioId: In(ids) } })
      : [];

    const permissoesPorUsuario = new Map<string, Map<string, boolean>>();
    for (const p of todasPermissoes) {
      if (!permissoesPorUsuario.has(p.usuarioId)) {
        permissoesPorUsuario.set(p.usuarioId, new Map());
      }
      permissoesPorUsuario.get(p.usuarioId)!.set(p.chave, p.habilitado);
    }

    return usuarios.map((u) => {
      const isSuperAdmin = u.role === Role.SUPER_ADMIN;
      const mapa = permissoesPorUsuario.get(u.id) ?? new Map<string, boolean>();
      const permissoes = Object.values(ChavePermissao).map((chave) => ({
        chave,
        descricao: PERMISSOES_DESCRICOES[chave],
        habilitado: isSuperAdmin ? true : (mapa.get(chave) ?? false),
      }));
      return {
        usuarioId: u.id,
        nome: u.nome,
        email: u.email,
        empresa: (u.empresa as any)?.nome ?? null,
        role: u.role,
        ativo: u.ativo,
        permissoes,
      };
    });
  }

  async listarMinhasPermissoes(usuarioId: string): Promise<Record<string, boolean>> {
    const registros = await this.permissaoRepo.find({ where: { usuarioId } });
    const mapa: Record<string, boolean> = {};
    for (const chave of Object.values(ChavePermissao)) {
      mapa[chave] = false;
    }
    for (const r of registros) {
      mapa[r.chave] = r.habilitado;
    }
    return mapa;
  }

  async atualizarPermissao(
    usuarioId: string,
    dto: UpdatePermissaoDto,
    operadorId: string,
  ): Promise<void> {
    const usuario = await this.usuarioRepo.findOne({ where: { id: usuarioId } });
    if (!usuario) throw new NotFoundException('Usuário não encontrado');

    // Captura valor anterior para auditoria completa
    const anterior = await this.permissaoRepo.findOne({
      where: { usuarioId, chave: dto.permissao },
    });
    const habilitadoAntes = anterior?.habilitado ?? false;

    await this.permissaoRepo.upsert(
      { usuarioId, chave: dto.permissao, habilitado: dto.habilitado },
      ['usuarioId', 'chave'],
    );

    await this.auditoriaService.registrar({
      usuarioId: operadorId,
      acao: AcaoAuditoria.ALTERACAO_PERMISSAO,
      entidade: 'usuario_permissao',
      entidadeId: usuarioId,
      dadosAntes: { permissao: dto.permissao, habilitado: habilitadoAntes },
      dadosDepois: { permissao: dto.permissao, habilitado: dto.habilitado },
    });
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
