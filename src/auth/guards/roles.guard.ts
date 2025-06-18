/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../user.schema';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  //RolesGuard is a class that implements CanActivate, which is part of NestJS's guards system.
  //It gets injected with NestJS’s Reflector, a utility used to retrieve metadata set by decorators (like  @UserRole()).

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    //Uses Reflector to retrieve the metadata for roles set using @Roles(...).
    // getAllAndOverride checks both:
    // the route handler (method level)
    // the class (controller level)
    // If @Roles(...) was set on a controller or a route handler, this grabs it.

    console.log('Required Roles', requiredRoles);
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('User Role', user?.role);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return matchRoles(requiredRoles, user?.role);
  }
}

function matchRoles(requiredRoles: string[], userRole: string) {
  return requiredRoles.some((role: string) => userRole.includes(role));
  //Checks if any of the requiredRoles match the userRole.
  // Uses .includes() which works even if userRole is a string like "Technician", and requiredRoles is an array like ["Admin", "Technician"].
}
