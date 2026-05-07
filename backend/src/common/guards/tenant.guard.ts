import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Role } from '../../modules/usuarios/usuario.entity';

/**
 * Garante que o usuário só acesse recursos da própria empresa.
 * SUPER_ADMIN ignora essa restrição.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new ForbiddenException('Não autenticado');
    if (user.role === Role.SUPER_ADMIN) return true;

    const empresaIdParam =
      request.params?.empresaId || request.query?.empresaId || request.body?.empresaId;

    if (empresaIdParam && empresaIdParam !== user.empresaId) {
      throw new ForbiddenException('Acesso negado a esta empresa');
    }

    // Injeta empresa_id do token na request para uso nos serviços
    request.empresaId = user.empresaId;

    return true;
  }
}
