import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { AppAbility, CheckPolicies } from 'src/auth/decorators/check.policies.decorator';
import { Action } from 'src/auth/casl/enums/casl.action';
import { Public } from 'src/auth/decorators/is.public.decorator';
import { forgotPasswordDto } from './dto/forgot.password.dto';
import { ValidateCodeDto } from './dto/validate.code.dto';

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

    @Post("forgot-password")
    @Public()
    forgotPassword(@Body() body: forgotPasswordDto){
        return this.usersService.forgotPassword(body.email);
    }

    @Post('forgot-password/validate')
    @Public()
    validateCode(@Body() body: ValidateCodeDto) {
        return this.usersService.validateForgotCode(
            body.email,
            body.code,
            body.newPassword,
        );
    }
}
