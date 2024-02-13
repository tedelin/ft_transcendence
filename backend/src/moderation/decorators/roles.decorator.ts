import { Reflector } from '@nestjs/core';
import { Role }	from '@prisma/client';

export const Roles = Reflector.createDecorator<Role[]>();