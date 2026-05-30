import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthEntity } from 'src/models/entities/auth.entity';
import { RolesEntity } from 'src/models/entities/roles.entity';
import { Users } from 'src/models/entities/users.entity';;
import { Repository } from 'typeorm';
import { createUserDto } from './dto/create.user.dto';
import * as bcrypt from 'bcrypt'
import { NotFoundError } from 'rxjs';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(Users)
        private usersRepository: Repository<Users>,
        @InjectRepository(RolesEntity)
        private rolesRepository: Repository<RolesEntity>,
        @InjectRepository(AuthEntity)
        private authRepository: Repository<AuthEntity>
    ){}

    async createUser(createUser: createUserDto){
        const newUser = new Users()

        const existingUser = await this.usersRepository.findOne({
            where: {
                email: createUser.email
            }
        })

        if(existingUser){
            throw new BadRequestException("Email already registered")
        }

        const criptPassword = await bcrypt.hash(
            createUser.password, 
            +process.env.BCRYPT_SALT!
        )

        newUser.email = createUser.email,
        newUser.name = createUser.name,
        newUser.password = criptPassword

        const role = await this.rolesRepository.findOne({
            where: {
                role: createUser.role
            }
        })

        if(!role){
            throw new NotFoundException("Role not found")
        }

        newUser.roles = [role]

        await this.usersRepository.save(newUser)

        return newUser
    }

    async findByIdWithRolesAndPermissions(id: string) {
        const user = await this.usersRepository.findOne({
            where: {
                id: id,
            },
            relations: {
                roles: {
                    permissions: true,
                },
            },
        });

        return user;
    }

    async getAllUser(){
        return this.usersRepository.find()
    }
}
