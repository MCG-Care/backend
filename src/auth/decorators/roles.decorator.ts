import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../user.schema';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

//This creates a custom decorator @Roles(...).
// When you use @Roles(UserRole.ADMIN), it sets metadata under the key 'roles'.
// That metadata is later retrieved by the guard using the Reflector.
