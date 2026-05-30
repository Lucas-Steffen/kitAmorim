import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString, IsStrongPassword } from "class-validator";
import { Roles } from "src/roles/enums/roles";

export class createUserDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    name: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    email: string;

    @IsStrongPassword({
        minLength: 8,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
    })
    @IsNotEmpty()
    @ApiProperty()
    password: string

    @IsEnum(Roles)
    @IsNotEmpty()
    @ApiProperty({
        enum: Roles
    })
    role: Roles
}