import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, UploadedFile, UseInterceptors, Req, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes, ApiBearerAuth } from "@nestjs/swagger";
import { UpdateUserDto } from "./dtos/update.user.dtos";
import { ImageDto } from "./dtos/image.dto";
import { CreateUserDto } from "./dtos";
import { Protected, Roles } from "src/decorators";
import { UserRoles } from "./enums";
import { CheckAuthGuard } from "src/guards";

@Controller("users")
@ApiBearerAuth('access-token') 
export class UserController {
    constructor(private service: UserService) { }

    @Get()
    @Protected(true)
    @Roles([UserRoles.ADMIN,UserRoles.SUPER_ADMIN])
    @UseGuards(CheckAuthGuard) 
    async getAll(@Req() req) {
        console.log("UserID:", req.userId); 
        return await this.service.getAll();
    }

    @Get(":id")
    @Protected(true)
    @Roles([UserRoles.ADMIN, UserRoles.SUPER_ADMIN])
    @UseGuards(CheckAuthGuard)
    async getOne(
        @Param('id', ParseIntPipe) id: number,
        @Req() req
    ) {
        console.log("UserID:", req.userId);
        return await this.service.getOne(id);
    }

    @Post()
    @Protected(true)
    @Roles([UserRoles.SUPER_ADMIN, ])
    @UseInterceptors(FileInterceptor('image'))
    @ApiConsumes('multipart/form-data')
    async createNew(@Body() payload: CreateUserDto, @UploadedFile() image: Express.Multer.File) {
        return await this.service.createNew(payload, image);
    }

    @Patch(':id')
    @Protected(true)
    @Roles([UserRoles.SUPER_ADMIN])
    @UseGuards(CheckAuthGuard)
    async updateUser(@Body() payload: UpdateUserDto,
        @Param('id', ParseIntPipe) id: number) {
        return await this.service.UpdateUser(payload, id);
    }

    @Put(":id/image")
    @Protected(true)
    @Roles([UserRoles.USER, UserRoles.SUPER_ADMIN, UserRoles.ADMIN])
    @UseInterceptors(FileInterceptor('image'))
    @ApiConsumes("multipart/form-data")
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                image: {
                    type: 'string',
                    format: 'binary'
                }
            }
        }
    })
    async update(@UploadedFile() image: Express.Multer.File,
        @Param('id', ParseIntPipe) id: number) {
        return await this.service.updateImg(image, id);
    }

    @Delete(':id')
    @Protected(true)
    @Roles([UserRoles.SUPER_ADMIN])
    @UseGuards(CheckAuthGuard)
    async delete(
        @Param('id', ParseIntPipe) id: number) {
        return await this.service.delete(id);
    }
}
