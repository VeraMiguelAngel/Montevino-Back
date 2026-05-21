import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { usersRole } from 'src/modules/users/users-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.user) {
      throw new ForbiddenException();
    }

    const userRole = request.user.role;

    const reqRoles = this.reflector.getAllAndOverride<usersRole | usersRole[]>(
      'role',
      [context.getHandler(), context.getClass()],
    );

    if (!reqRoles) {
      return true;
    }

    const rolesArray = Array.isArray(reqRoles) ? reqRoles : [reqRoles];

    if (!rolesArray.includes(userRole)) {
      throw new ForbiddenException(
        'No estás autorizado para acceder a este recurso',
      );
    }

    return true;
  }
}
