import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { UserRoles } from '../enums';

export class CreateUserDto {
  @ApiProperty({
    type: 'string',
    required: true,
    example: 'Tom',
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: 'string',
    required: true,
    example: 'tom@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    type: 'number',
    required: true,
    example: 18,
  })
  @Transform(({ value }) => {
    return parseInt(value);
  })
  @IsInt()
  @IsPositive()
  @Min(18)
  age: number;

  @ApiProperty({
    type: 'string',
    required: true,
    example: 'tom123',
  })
  @IsString()
  password: string;

  @ApiProperty({
    type: 'string',
    enum: UserRoles,
    default: UserRoles.USER,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRoles)
  role: UserRoles;
}
