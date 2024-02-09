// import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
// import { UserService } from 'src/user/user.service';

// @Injectable()
// export class ChannelRolesGuard implements CanActivate {
//   constructor(private readonly usersService: UserService) {}

//   async canActivate(context: ExecutionContext, requiredRole: string): Promise<boolean> {
//     const request = context.switchToHttp().getRequest();
//     const userId = request.user.id;
	
//     try {
//       const userRole = await this.usersService.getUserRole(userId);
//       return userRole === requiredRole;
//     } catch (error) {
//       return false;
//     }
//   }
// }
