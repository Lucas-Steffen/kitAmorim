import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { AppAbility, CheckPolicies } from 'src/auth/decorators/check.policies.decorator';
import { Action } from 'src/auth/casl/enums/casl.action';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService
    ){}

    @Get("all")
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Manage, "users"))
    async getAllUsers(){
        return this.usersService.getAllUser();
    }
}
