import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateInviteDto {
  @ApiProperty({ example: 'locatario@email.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
