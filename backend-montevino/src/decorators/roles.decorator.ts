import { SetMetadata } from '@nestjs/common';
import { usersRole } from 'src/modules/users/users-role.enum';

export const Roles = (...roles: usersRole[]) => SetMetadata('role', roles);
