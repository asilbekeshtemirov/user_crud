import { Injectable, ConflictException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import * as bcrypt from "bcryptjs";
import { User } from "./models";
import { LoginDto, RegisterDto } from "./dtos";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    private readonly jwtService: JwtService
  ) {}

  async register(payload: RegisterDto) {
    await this._checkExistingUserByEmail(payload.email);

    const passwordHash = await bcrypt.hash(payload.password, 10);

    const user = await this.userModel.create({
      email: payload.email,
      name: payload.name,
      password: passwordHash,
    });

    const accessToken = this.jwtService.sign({
      id: user.id,
      role: user.role,
    });

    return {
      message: "Muvaffaqiyatli ro'yxatdan o'tildi",
      data: {
        accessToken,
        user,
      },
    };
  }

  async login(payload: LoginDto) {
    const user = await this._checkUserByEmail(payload.email);

    // Parolni solishtirish
    const isMatch = await bcrypt.compare(payload.password, user.password);

    if (!isMatch) {
      throw new ConflictException("Parol xato");
    }

    const accessToken = this.jwtService.sign({
      id: user.id,
      role: user.role,
    });

    return {
      message: "Muvaffaqiyatli tizimga kirildi",
      data: {
        accessToken,
        user,
      },
    };
  }

  private async _checkExistingUserByEmail(email: string) {
    const user = await this.userModel.findOne({ where: { email } });

    if (user) {
      throw new ConflictException("Bunday email allaqachon mavjud");
    }
  }

  private async _checkUserByEmail(email: string) {
    const user = await this.userModel.findOne({ where: { email } });

    if (!user) {
      throw new ConflictException("Bunday email topilmadi");
    }

    return user;
  }
}
