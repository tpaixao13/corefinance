import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Usuario } from '../usuarios/usuario.entity';
import { LoginDto } from './dto/login.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { AcaoAuditoria } from '../auditoria/auditoria-log.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    private readonly jwtService: JwtService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async login(dto: LoginDto, ipAddress?: string) {
    const usuario = await this.usuarioRepo.findOne({
      where: { email: dto.email, ativo: true },
    });

    if (!usuario) throw new UnauthorizedException('Credenciais inválidas');

    const senhaValida = await bcrypt.compare(dto.senha, usuario.senhaHash);
    if (!senhaValida) throw new UnauthorizedException('Credenciais inválidas');

    await this.auditoriaService.registrar({
      usuarioId: usuario.id,
      empresaId: usuario.empresaId ?? undefined,
      acao: AcaoAuditoria.LOGIN,
      entidade: 'usuario',
      entidadeId: usuario.id,
      dadosDepois: { email: usuario.email, role: usuario.role },
      ipAddress,
    });

    const payload = {
      sub: usuario.id,
      email: usuario.email,
      role: usuario.role,
      empresaId: usuario.empresaId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        empresaId: usuario.empresaId,
      },
    };
  }
}
