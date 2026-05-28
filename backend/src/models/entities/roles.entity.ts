import {
  Column,
  Entity,
  JoinTable,
  ManyToMany
} from "typeorm";
import { Roles as RolesEnum } from "../../roles/enums/roles"; 
import { Users } from "src/models/entities/users.entity";
import { BaseEntity } from "src/models/entities/base.entity";
import { Permissions } from "src/models/entities/permissions.entity";

@Entity()
export class RolesEntity extends BaseEntity {
  @Column({
    type: "enum",
    enum: RolesEnum, 
  })
  role: RolesEnum;   

  @ManyToMany(() => Users, (Users) => Users.roles)
  @JoinTable()
  users: Users[];

  @ManyToMany(() => Permissions, (permissions) => permissions.roles)
  @JoinTable()
  permissions: Permissions[];
}