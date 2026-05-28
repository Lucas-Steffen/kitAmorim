import { BaseEntity } from "src/models/entities/base.entity";
import { RolesEntity } from "src/models/entities/roles.entity";
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany
} from "typeorm";
import { AuthEntity } from "./auth.entity";

@Entity()
export class Users extends BaseEntity {
  @Column()
  name: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column()
  password: string;

  @ManyToMany(() => RolesEntity, (roles) => roles.users)
  roles: RolesEntity[];

  @OneToMany(() => AuthEntity, (auth) => auth.user)
  authCodes: AuthEntity[]
}