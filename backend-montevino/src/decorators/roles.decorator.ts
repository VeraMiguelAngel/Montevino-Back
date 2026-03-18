import { SetMetadata } from '@nestjs/common';
import { usersRole } from 'src/modules/users/users-role.enum';

export const Roles = (role: usersRole) => SetMetadata('role', role);
