import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dtos';
import { ApiOperation } from '@nestjs/swagger';
import { Protected, Roles } from 'src/decorators';
import { UserRoles } from './enums';

@Controller('auth')
export class AuthController {
  constructor(private service: AuthService) {}

  @ApiOperation({ summary: "Ro'yhatdan o'tish" })
  @Post('sign-up')
  @Protected(false)
  @Roles([UserRoles.ADMIN, UserRoles.SUPER_ADMIN, UserRoles.USER])
  async signUp(@Body() payload: RegisterDto) {
    return await this.service.register(payload);
  }

  @ApiOperation({ summary: 'Profilga kirish' })
  @Post('sign-in')
  @Protected(false)
  @Roles([UserRoles.ADMIN, UserRoles.SUPER_ADMIN, UserRoles.USER])
  async signIn(@Body() payload: LoginDto) {
    return await this.service.login(payload);
  }
}
