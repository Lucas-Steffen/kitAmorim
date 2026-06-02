import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthEntity } from 'src/models/entities/auth.entity';
import { RolesEntity } from 'src/models/entities/roles.entity';
import { Users } from 'src/models/entities/users.entity';;
import { Repository } from 'typeorm';
import { createUserDto } from './dto/create.user.dto';
import * as bcrypt from 'bcrypt'
import { NotFoundError } from 'rxjs';
import { randomNumbersToCode } from 'src/helpers/randomNumbersToCode';
import { MailService } from 'src/mailer/mailer.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(Users)
        private usersRepository: Repository<Users>,
        @InjectRepository(RolesEntity)
        private rolesRepository: Repository<RolesEntity>,
        @InjectRepository(AuthEntity)
        private authRepository: Repository<AuthEntity>,
        private mailerService: MailService
    ) { }

    async createUser(createUser: createUserDto) {
        const newUser = new Users()

        const existingUser = await this.usersRepository.findOne({
            where: {
                email: createUser.email
            }
        })

        if (existingUser) {
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

        if (!role) {
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

    async getAllUser() {
        return this.usersRepository.find()
    }

    async forgotPassword(email: string) {
        const user = await this.usersRepository.findOne({ where: { email } })

        if (!user) {
            return {
                message: "If the email is registered, you will receive a password reset code"
            }
        }

        await this.authRepository.delete({
            user: {
                id: user.id
            }
        })

        const code = await randomNumbersToCode();

        const expiresAt = new Date();

        const authCode = this.authRepository.create({
            code,
            expiresAt,
            user
        });

        await this.authRepository.save(authCode);

        await this.mailerService.sendEmail(
            email,
            'Recuperação de senha KitFlow',
            `<!DOCTYPE html>
                <html lang="pt-BR">
                <head>
                <meta charset="UTF-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <title>Recuperação de senha — KitAmorim</title>
                </head>
                <body style="margin:0;padding:0;background:#f0f2f5;font-family:Arial,sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:40px 0;">
                <tr>
                    <td align="center">
                    <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #dde1e8;">

                        <!-- Header escuro -->
                        <tr>
                        <td style="background:#0f172a;padding:26px 40px;">
                            <table cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="vertical-align:middle;">
                                <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;font-family:Arial,sans-serif;">Kit<span style="color:#60a5fa;">Amorim</span></span>
                                </td>
                                <td style="padding-left:14px;vertical-align:middle;">
                                <span style="font-size:11px;background:rgba(96,165,250,0.15);color:#93c5fd;padding:3px 10px;border-radius:20px;letter-spacing:1px;font-family:Arial,sans-serif;">Plataforma</span>
                                </td>
                            </tr>
                            </table>
                        </td>
                        </tr>

                        <!-- Faixa divisória sutil -->
                        <tr>
                        <td style="background:#1e293b;padding:10px 40px;">
                            <p style="font-size:11px;color:#94a3b8;margin:0;text-transform:uppercase;letter-spacing:2px;font-family:Arial,sans-serif;">Segurança da conta</p>
                        </td>
                        </tr>

                        <!-- Body -->
                        <tr>
                        <td style="padding:36px 40px 30px;">
                            <h1 style="font-size:22px;font-weight:700;color:#1a2340;margin:0 0 16px;font-family:Arial,sans-serif;">Recuperação de senha</h1>
                            <p style="font-size:15px;color:#555e7a;line-height:1.75;margin:0 0 28px;font-family:Arial,sans-serif;">
                            Recebemos uma solicitação para redefinir a senha da sua conta.
                            Use o código abaixo para continuar. Ele é válido por
                            <strong style="color:#1a2340;">15 minutos</strong>.
                            </p>

                            <!-- Code box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                            <tr>
                                <td style="background:#eef4ff;border:1px solid #bfcfee;border-radius:10px;padding:24px;text-align:center;">
                                <p style="font-size:11px;color:#6b7baa;margin:0 0 10px;text-transform:uppercase;letter-spacing:3px;font-family:Arial,sans-serif;">Seu código</p>
                                <p style="font-size:38px;font-weight:700;letter-spacing:14px;color:#1e3a8a;margin:0;font-family:monospace;">${code}</p>
                                </td>
                            </tr>
                            </table>

                            <!-- Warning -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                            <tr>
                                <td style="background:#f7f8fc;border-left:3px solid #3b82f6;padding:14px 16px;">
                                <p style="font-size:13px;color:#6b7baa;margin:0;line-height:1.65;font-family:Arial,sans-serif;">
                                    Se você não solicitou a recuperação de senha, ignore este e-mail. Sua conta permanece segura.
                                </p>
                                </td>
                            </tr>
                            </table>

                            <p style="font-size:14px;color:#6b7baa;line-height:1.75;margin:0;font-family:Arial,sans-serif;">
                            Atenciosamente,<br/>
                            <strong style="color:#1a2340;">Equipe KitAmorim</strong>
                            </p>
                        </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                        <td style="background:#0f172a;border-top:1px solid #1e293b;padding:16px 40px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="font-size:12px;color:#475569;font-family:Arial,sans-serif;">© 2026 KitAmorim</td>
                                <td align="right" style="font-size:12px;color:#475569;font-family:Arial,sans-serif;">Este é um e-mail automático</td>
                            </tr>
                            </table>
                        </td>
                        </tr>

                    </table>
                    </td>
                </tr>
                </table>
                </body>
                </html>`)

        return {
            message: "If the email is registered, you will receive a password reset code"
        }
    }

    async validateForgotCode(email: string, code: string, newPassword: string){
        const user = await this.usersRepository.findOne({ where: { email }, relations: { authCodes: true}})

        if(!user){
            throw new NotFoundError("User not found")
        }

        const now = new Date();

        const authCode = await this.authRepository.findOne({
            where: {
                code,
                user: {
                    id: user.id
                }
            },
            relations: {
                user: true
            }
        })

        if(!authCode){
            throw new BadRequestException("Invalid code")
        }

        if(authCode.expiresAt < now){
            await this.authRepository.softDelete({ id: authCode.id })
            throw new BadRequestException("Code expired")
        }

        const hashed = await bcrypt.hash(newPassword, +process.env.BCRYPT_SALT!);
        user.password = hashed;

        await this.usersRepository.save(user);
        await this.authRepository.softDelete({
            id: authCode.id
        });

        return {
            message: "Password reset successfully"
        }
    }
}
