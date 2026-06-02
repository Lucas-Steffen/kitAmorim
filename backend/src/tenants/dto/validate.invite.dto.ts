import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ValidateInviteDto {
  @ApiProperty({ example: 'A3F7K2QX' })
  @IsString()
  @IsNotEmpty()
  @Length(8, 8)
  code: string;
}
