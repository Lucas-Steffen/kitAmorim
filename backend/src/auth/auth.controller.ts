import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AppAbility, CheckPolicies } from './decorators/check.policies.decorator';
import { Action } from './casl/enums/casl.action';
import { ApiBody } from '@nestjs/swagger';
import { createUserDto } from 'src/users/dto/create.user.dto';
import { Public } from './decorators/is.public.decorator';
import { LoginCredentialsDto } from './dtos/login.credentials.dto';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private usersService: UsersService
    ){}

    @Post("signup")
    @CheckPolicies((ability: AppAbility) => ability.can(Action.Create, "users"))
    @ApiBody({
        type: createUserDto
    })
    async signup(@Body() createUser: createUserDto){
        return this.usersService.createUser(createUser)
    }

    @Post("login")
    @Public()
    @ApiBody({
        type: LoginCredentialsDto
    })
    async login(@Body() loginCredentials: LoginCredentialsDto){
        return this.authService.login(loginCredentials)
    }

    @CheckPolicies((ability: AppAbility) => ability.can(Action.Read, "validate"))
    @Get("validate")
    async validateUser(@Req() request) {
        return request.user;
    }
}
