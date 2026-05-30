import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/models/entities/users.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'
import { LoginCredentialsDto } from './dtos/login.credentials.dto';

interface JwtPayload {
    sub: string,
    email: string
}

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Users)
        private userRepository: Repository<Users>,
        private jwtService: JwtService
    ){}

    async login(loginCredentials: LoginCredentialsDto){
        const existingUser = await this.userRepository.findOne({
            where: {
                email: loginCredentials.email
            }
        })

        if(!existingUser){
            throw new UnauthorizedException("Email or password is invalid!")
        }

        const validatePass = await bcrypt.compare(
            loginCredentials.password,
            existingUser.password
        )

        if(!validatePass){
            throw new UnauthorizedException("Email or password is invalid!")
        }

        const payload: JwtPayload = {
            sub: existingUser.id,
            email: existingUser.email
        }

        return {
            token: await this.jwtService.signAsync(payload, {
                secret: process.env.JWT_SECRET
            })
        }
    }
}