import autoBind from 'auto-bind'
import { injectable } from 'inversify'
import nodemailer from 'nodemailer'

@injectable()
export class MailService {
  private transporter: nodemailer.Transporter

  constructor() {
    autoBind(this)

    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    })

    this.verifyConnection()
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify()
      console.log('✅ Mail transporter ready (Gmail)')
    } catch (err) {
      console.error('❌ Mail transporter error:', err)
    }
  }

  /**
   * Gửi email
   * @param to Địa chỉ người nhận
   * @param subject Tiêu đề email
   * @param html Nội dung HTML
   * @param text Nội dung text fallback (tùy chọn)
   */
  async sendMail({ to, subject, html, text }: { to: string; subject: string; html: string; text?: string }) {
    try {
      const info = await this.transporter.sendMail({
        from: `"Locker System" <${process.env.MAIL_USER}>`,
        to,
        subject,
        text,
        html
      })
      console.log(`📧 Email sent to ${to}: ${info.messageId}`)
      return info
    } catch (err) {
      console.error('❌ Error sending mail:', err)
      throw err
    }
  }
}
