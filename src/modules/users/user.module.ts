import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { SequelizeModule } from "@nestjs/sequelize";
import { User } from "./models";
import { FsHelper } from "src/helpers";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
  imports: [
    SequelizeModule.forFeature([User]),
    JwtModule.register({
        global:true,
        secret: 'your-secret-key',  
        signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [UserService, FsHelper, AuthService], 
  controllers: [UserController, AuthController],
})
export class UserModule {}
