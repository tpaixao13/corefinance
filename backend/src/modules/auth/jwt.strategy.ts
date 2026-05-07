import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  empresaId: string | null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') as string,
    });
  }

  async validate(payload: JwtPayload) {
    const usuario = await this.usuarioRepo.findOne({
      where: { id: payload.sub, ativo: true },
    });

    if (!usuario) throw new UnauthorizedException('Token inválido ou usuário inativo');

    return {
      id: usuario.id,
      email: usuario.email,
      role: usuario.role,
      empresaId: usuario.empresaId,
      nome: usuario.nome,
    };
  }
}
