import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { CaslAbilityFactory } from "src/auth/casl/casl.ability.factory";
import { IS_PUBLIC_KEY } from "./decorators/is.public.decorator";
import {
    PolicyHandler,
    AppAbility,
    CHECK_POLICIES_KEY
} from "./decorators/check.policies.decorator";
import { Action } from "./casl/enums/casl.action";

@Injectable()
export class PoliciesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private caslAbilityFactory: CaslAbilityFactory,
    ) { }

    async canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const policyHandlers =
            this.reflector.get<PolicyHandler[]>(
                CHECK_POLICIES_KEY,
                context.getHandler(),
            ) || [];

        const { user } = context.switchToHttp().getRequest();
        const ability = this.caslAbilityFactory.createForUser(user);

        // Garante que se o cargo tiver um "manage"."manage" ele tem acesso a tudo, nesse caso um cargo de ADMIN total do sistema
        if (ability.can(Action.Manage, "manage")) {
            return true;
        }

        return policyHandlers.every((handler) =>
            this.execPolicyHandler(handler, ability),
        );
    }

    private execPolicyHandler(handler: PolicyHandler, ability: AppAbility) {
        if (typeof handler === "function") {
            return handler(ability);
        }
        return handler.handle(ability);
    }
}