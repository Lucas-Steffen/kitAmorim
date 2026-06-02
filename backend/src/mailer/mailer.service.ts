import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
    constructor(
        private readonly mailer: MailerService
    ){}

    async sendEmail(to: string, subject: string, html: string){
        await this.mailer.sendMail({
            to,
            subject,
            html
        })
    }
}
