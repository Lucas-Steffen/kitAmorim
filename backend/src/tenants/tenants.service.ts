import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { GuestInviteEntity, InviteStatus } from 'src/models/entities/guest.invite.entity';
import { Users } from 'src/models/entities/users.entity';
import { RolesEntity } from 'src/models/entities/roles.entity';
import { MailService } from 'src/mailer/mailer.service';
import { Roles } from 'src/roles/enums/roles';
import { randomInviteCode } from 'src/helpers/randomInviteCode';
import { CreateInviteDto } from './dto/create.invite.dto';
import { ActivateInviteDto } from './dto/activate.invite.dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(GuestInviteEntity)
    private inviteRepository: Repository<GuestInviteEntity>,
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    @InjectRepository(RolesEntity)
    private rolesRepository: Repository<RolesEntity>,
    private mailerService: MailService,
    private jwtService: JwtService,
  ) {}

  async createInvite(dto: CreateInviteDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Este e-mail já possui uma conta ativa');
    }

    await this.inviteRepository.delete({
      email: dto.email,
      status: InviteStatus.PENDING,
    });

    const code = randomInviteCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    const invite = this.inviteRepository.create({ email: dto.email, code, expiresAt });
    await this.inviteRepository.save(invite);

    await this.mailerService.sendEmail(
      dto.email,
      'Convite de acesso — KitAmorim',
      this.buildInviteEmail(code),
    );

    return { message: 'Convite enviado com sucesso' };
  }

  async validateInvite(code: string) {
    const invite = await this.inviteRepository.findOne({
      where: { code, status: InviteStatus.PENDING },
    });

    if (!invite) {
      throw new NotFoundException('Código de convite inválido ou já utilizado');
    }

    if (invite.expiresAt < new Date()) {
      throw new BadRequestException('Código de convite expirado');
    }

    return { valid: true, email: invite.email };
  }

  async activateInvite(dto: ActivateInviteDto) {
    const invite = await this.inviteRepository.findOne({
      where: { code: dto.code, status: InviteStatus.PENDING },
    });

    if (!invite) {
      throw new NotFoundException('Código de convite inválido ou já utilizado');
    }

    if (invite.expiresAt < new Date()) {
      throw new BadRequestException('Código de convite expirado');
    }

    const existingUser = await this.usersRepository.findOne({
      where: { email: invite.email },
    });

    if (existingUser) {
      throw new ConflictException('Já existe uma conta para este e-mail');
    }

    const role = await this.rolesRepository.findOne({
      where: { role: Roles.USER },
    });

    if (!role) {
      throw new NotFoundException('Role padrão não encontrada');
    }

    const hashed = await bcrypt.hash(dto.password, +process.env.BCRYPT_SALT!);

    const user = this.usersRepository.create({
      name: dto.name,
      email: invite.email,
      password: hashed,
      roles: [role],
    });

    await this.usersRepository.save(user);

    invite.status = InviteStatus.USED;
    invite.user = user;
    await this.inviteRepository.save(invite);

    const token = await this.jwtService.signAsync(
      { sub: user.id, email: user.email },
      { secret: process.env.JWT_SECRET },
    );

    return { token };
  }

  private buildInviteEmail(code: string): string {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Convite de acesso — KitAmorim</title>
</head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:40px 0;">
<tr>
  <td align="center">
  <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;border:1px solid #dde1e8;">

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

    <tr>
    <td style="background:#1e293b;padding:10px 40px;">
      <p style="font-size:11px;color:#94a3b8;margin:0;text-transform:uppercase;letter-spacing:2px;font-family:Arial,sans-serif;">Acesso ao aplicativo</p>
    </td>
    </tr>

    <tr>
    <td style="padding:36px 40px 30px;">
      <h1 style="font-size:22px;font-weight:700;color:#1a2340;margin:0 0 16px;font-family:Arial,sans-serif;">Você foi convidado!</h1>
      <p style="font-size:15px;color:#555e7a;line-height:1.75;margin:0 0 28px;font-family:Arial,sans-serif;">
        Você recebeu um convite de acesso ao aplicativo KitAmorim.<br/>
        Abra o aplicativo, selecione <strong style="color:#1a2340;">"Entrar com código convite"</strong>
        e informe o código abaixo para criar sua senha de acesso.
        O código é válido por <strong style="color:#1a2340;">48 horas</strong>.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td style="background:#eef4ff;border:1px solid #bfcfee;border-radius:10px;padding:24px;text-align:center;">
        <p style="font-size:11px;color:#6b7baa;margin:0 0 10px;text-transform:uppercase;letter-spacing:3px;font-family:Arial,sans-serif;">Seu código de convite</p>
        <p style="font-size:34px;font-weight:700;letter-spacing:10px;color:#1e3a8a;margin:0;font-family:monospace;">${code}</p>
        </td>
      </tr>
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr>
        <td style="background:#f7f8fc;border-left:3px solid #3b82f6;padding:14px 16px;">
        <p style="font-size:13px;color:#6b7baa;margin:0;line-height:1.65;font-family:Arial,sans-serif;">
          Se você não esperava este convite, ignore este e-mail com segurança.
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
</html>`;
  }
}
