import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsStrongPassword, Length } from 'class-validator';

export class ActivateInviteDto {
  @ApiProperty({ example: 'A3F7K2QX' })
  @IsString()
  @IsNotEmpty()
  @Length(8, 8)
  code: string;

  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Senha@123' })
  @IsStrongPassword({
    minLength: 8,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;
}
