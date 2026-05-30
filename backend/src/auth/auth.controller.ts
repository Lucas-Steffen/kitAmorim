import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AppAbility, CheckPolicies } from './decorators/check.policies.decorator';
import { Action } from './casl/enums/casl.action';
import { ApiBody } from '@nestjs/swagger';
import { createUserDto } from 'src/users/dto/create.user.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService
    ){}

    @Post("signup")
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, "users"))
    @ApiBody({
        type: createUserDto
    })
    async signup(@Body() createUser: createUserDto){

    }
}
