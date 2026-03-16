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

    const reqRole = this.reflector.getAllAndOverride<usersRole>('role', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!reqRole) {
      return true;
    }

    if (!reqRole) {
      return true;
    }

    if (userRole !== reqRole) {
      throw new ForbiddenException(
        'No estás autorizado para acceder a este recurso',
      );
    }

    return true;
  }
}
