import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Length, MinLength } from "class-validator";

export class ValidateCodeDto {
    @IsEmail()
    @ApiProperty()
    email: string;

    @IsString()
    @ApiProperty()
    @Length(6,6)
    code: string;

    @IsString()
    @ApiProperty()
    @MinLength(8)
    newPassword: string;
}