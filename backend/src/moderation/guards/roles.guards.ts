import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ModerationService } from '../moderation.service';
import { Roles } from '../decorators/roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(
	private readonly moderationService: ModerationService,
	private reflector: Reflector
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const requiredRoles = this.reflector.get(Roles, context.getHandler());
		const request = context.switchToHttp().getRequest();
		const userRole = await this.moderationService.getRole(request.user.id, request.params.name);
		const hasRequired = requiredRoles.includes(userRole); 
		if (!hasRequired) throw new UnauthorizedException('Insufficient permissions');

		return hasRequired;
	}
}
