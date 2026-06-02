import { Users } from './users.entity';
import { RolesEntity } from './roles.entity';
import { AuthEntity } from './auth.entity';
import { Permissions } from './permissions.entity';
import { GuestInviteEntity } from './guest.invite.entity';

export const entities = [Users, RolesEntity, AuthEntity, Permissions, GuestInviteEntity];
