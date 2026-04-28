import { Resend } from "resend";
import serverConfig from "../config/server.config";
import { BadRequestError } from "../errors";

class EmailService {
  private readonly client: Resend | null = serverConfig.RESEND.API_KEY
    ? new Resend(serverConfig.RESEND.API_KEY)
    : null;

  public async sendMagicLinkEmail(to: string, link: string): Promise<void> {
    if (!this.client) {
      throw new BadRequestError("Magic link email is not configured");
    }

    await this.client.emails.send({
      from: serverConfig.RESEND.EMAIL_FROM,
      to,
      subject: "Your Fitloka magic login link",
      html: `<p>Click the link below to sign in:</p><p><a href="${link}">${link}</a></p><p>This link expires in 15 minutes.</p>`,
      text: `Sign in with this magic link (expires in 15 minutes): ${link}`,
    });
  }

  public async sendEmailConfirmationEmail(to: string, link: string): Promise<void> {
    if (!this.client) {
      throw new BadRequestError("Email confirmation is not configured");
    }

    await this.client.emails.send({
      from: serverConfig.RESEND.EMAIL_FROM,
      to,
      subject: "Confirm your Fitloka account",
      html: `<p>Welcome to Fitloka.</p><p>Confirm your email by clicking:</p><p><a href="${link}">${link}</a></p><p>This link expires in 24 hours.</p>`,
      text: `Confirm your email (expires in 24 hours): ${link}`,
    });
  }
}

export default new EmailService();
