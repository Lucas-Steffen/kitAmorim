import { MongoAbility, MongoQuery } from "@casl/ability"
import { Action } from "../casl/enums/casl.action"
import { Subjects } from "../casl/enums/casl.subject"
import { applyDecorators, SetMetadata } from "@nestjs/common"
import { ApiBearerAuth } from "@nestjs/swagger"

export const CHECK_POLICIES_KEY = "check_policy"

export type AppAbility = MongoAbility<[Action, Subjects], MongoQuery>

interface IPolicyHandler {
    handle(ability: AppAbility): boolean
}

type PolicyHandlerCallback = (ability: AppAbility) => boolean;

export type PolicyHandler = IPolicyHandler | PolicyHandlerCallback;

export const CheckPolicies = (...handlers: PolicyHandler[]) =>
    applyDecorators(SetMetadata(CHECK_POLICIES_KEY, handlers), ApiBearerAuth())