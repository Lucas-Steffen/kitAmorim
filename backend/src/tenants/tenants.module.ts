import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { GuestInviteEntity } from 'src/models/entities/guest.invite.entity';
import { Users } from 'src/models/entities/users.entity';
import { RolesEntity } from 'src/models/entities/roles.entity';
import { MailModule } from 'src/mailer/mailer.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GuestInviteEntity, Users, RolesEntity]),
    JwtModule,
    MailModule,
  ],
  controllers: [TenantsController],
  providers: [TenantsService],
})
export class TenantsModule {}
