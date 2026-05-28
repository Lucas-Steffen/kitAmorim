import type { Subjects } from "src/auth/casl/enums/casl.subject";
import { Action } from "src/auth/casl/enums/casl.action";
import { BaseEntity } from "src/models/entities/base.entity";
import { RolesEntity } from "src/models/entities/roles.entity";
import {
    Column,
    Entity,
    ManyToMany
} from "typeorm";

@Entity()
export class Permissions extends BaseEntity {
    @Column({
        type: "enum",
        enum: Action,
    })
    action!: Action;

    @Column()
    subject!: Subjects;

    @ManyToMany(() => RolesEntity, (roles) => roles.permissions)
    roles!: RolesEntity[];
}