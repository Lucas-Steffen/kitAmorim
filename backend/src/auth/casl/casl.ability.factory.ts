import {
  AbilityBuilder,
  createMongoAbility,
  MongoAbility,
  MongoQuery,
} from "@casl/ability";
import { Injectable } from "@nestjs/common";
import { Users } from "src/models/entities/users.entity";
import { Action } from "./enums/casl.action";
import { Subjects } from "./enums/casl.subject";

@Injectable()
export class CaslAbilityFactory {
  // Precisa que o usuário tenha as roles e as permissions
  createForUser(usuario: Users) {
    const { can, cannot, build } = new AbilityBuilder<
      MongoAbility<[Action, Subjects], MongoQuery>
    >(createMongoAbility);

    for (const role of usuario.roles) {
      for (const permissions of role.permissions) {
        // Com base no arquivo permissions.map o can vai ser algo tipo ("All", "Usuarios") que deve ser recebido nessa parte
        can(permissions.action, permissions.subject);
      }
    }

    return build();
  }
}