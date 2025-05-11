import {
  BadRequestException,
  CanActivate,
  ConflictException,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { UserRoles } from 'src/modules/users/enums';
import { PROTECTED_KEY } from 'src/decorators';
import { Request } from 'express';

@Injectable()
export class CheckAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isProtected = this.reflector.getAllAndOverride<boolean>(
      PROTECTED_KEY,
      [context.getHandler(), context.getClass()],
    );

    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request & { role?: string; userId?: string }>();

    if (!isProtected) {
      request.role = UserRoles.USER;
      return true;
    }

    const token = request.headers.authorization; 
    // console.log('Token:', token);
    // console.log('Headers:', request.headers);

    if (!token || !token.startsWith('Bearer ')) {
      throw new BadRequestException('Please enter your token!');
    }

    const accessToken = token.split('Bearer ')[1].trim();

    if (!accessToken) {
      throw new BadRequestException('Please enter your accessToken!');
    }

    try {
      const data = this.jwtService.verify(accessToken);
      request.userId = data?.id;
      request.role = data?.role;
      console.log('Decoded token data:', data);
      return true;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new ForbiddenException('Your token is expired!');
      }
      console.log(error)

      if (error instanceof JsonWebTokenError) {
        throw new ConflictException('Token is invalid!');
      }

      throw new InternalServerErrorException('Internal error!');
    }
  }
}
