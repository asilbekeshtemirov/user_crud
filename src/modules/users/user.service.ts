import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { User } from "./models";
import { FsHelper } from "src/helpers";
import { UpdateUserDto } from "./dtos/update.user.dtos";
import { ImageDto } from "./dtos/image.dto";
import { CreateUserDto } from "./dtos";
import * as bcrypt from "bcryptjs";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    private fs: FsHelper
  ) {}

  async getAll() {
    const users = await this.userModel.findAll();
    return {
      message: "success",
      count: users.length,
      data: users,
    };
  }

  async getOne(id: number) {
    const user = await this.userModel.findByPk(id);
    return {
      message: "success",
      data: user,
    };
  }

  async createNew(payload: CreateUserDto, image: Express.Multer.File) {
    const foundedUser = await this.userModel.findOne({ where: { email: payload.email } });
    if (foundedUser) {
      throw new BadRequestException("This user is already exist!");
    }

    let imgUrl: string = '';
    if (image) {
      imgUrl = await this.fs.uploadFile(image);
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);

    const user = await this.userModel.create({
      name: payload.name,
      email: payload.email,
      password: passwordHash,
      age: payload.age,
      image: imgUrl,
    });

    return {
      message: "yaratildi",
      data: user,
    };
  }

  async UpdateUser(payload: UpdateUserDto, id: number) {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    let password = user.password;
    if (payload.password) {
      password = await bcrypt.hash(payload.password, 10);
    }

    await this.userModel.update(
      {
        name: payload.name || user.name,
        email: payload.email || user.email,
        password: password,
        age: payload.age || user.age,
      },
      { where: { id: id } }
    );

    const updated = await this.userModel.findByPk(id);
    return {
      message: "success",
      data: updated,
    };
  }

  async updateImg(image: Express.Multer.File, id: number) {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.dataValues.image) {
      await this.fs.deleteFile(user.dataValues.image);
    }

    const imgUrl = await this.fs.uploadFile(image);
    await this.userModel.update(
      { image: imgUrl },
      { where: { id: id } }
    );

    const updated = await this.userModel.findByPk(id);
    return {
      message: "success",
      data: updated,
    };
  }

  async delete(id: number) {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.dataValues.image) {
      await this.fs.deleteFile(user.dataValues.image);
    }

    await this.userModel.destroy({
      where: { id: id },
    });

    return {
      message: "Successfully deleted!",
    };
  }
}
