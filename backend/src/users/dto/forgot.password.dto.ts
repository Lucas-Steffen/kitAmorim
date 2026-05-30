import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class forgotPasswordDto {
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty()
    email: string
}