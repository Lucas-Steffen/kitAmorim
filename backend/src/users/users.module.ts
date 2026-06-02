import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthEntity } from 'src/models/entities/auth.entity';
import { Permissions } from 'src/models/entities/permissions.entity';
import { RolesEntity } from 'src/models/entities/roles.entity';
import { Users } from 'src/models/entities/users.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from 'src/mailer/mailer.module';

@Module({
  imports: [TypeOrmModule.forFeature([Users, RolesEntity, AuthEntity, Permissions]), MailModule],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [TypeOrmModule, UsersService]
})
export class UsersModule {}
