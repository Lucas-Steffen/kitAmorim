import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthEntity } from 'src/models/entities/auth.entity';
import { RolesEntity } from 'src/models/entities/roles.entity';
import { Users } from 'src/models/entities/users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Users, RolesEntity, AuthEntity])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [TypeOrmModule, UsersService]
})
export class UsersModule {}
