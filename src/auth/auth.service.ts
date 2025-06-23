import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { v4 as uuidv4 } from 'uuid';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(pass, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async sendPasswordResetEmail(email: string) {
    // TODO: Implement email sending logic
    const user = await this.usersService.findByEmail(email);
    if (!user) return;
    const token = uuidv4();
    await this.usersService.setPasswordResetToken(user.id, token);
    // await this.emailService.sendPasswordReset(user.email, token);
    return { message: 'Password reset email sent (stub)' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByResetToken(token);
    if (!user) throw new UnauthorizedException('Invalid or expired token');
    await this.usersService.updatePassword(user.id, newPassword);
    await this.usersService.clearPasswordResetToken(user.id);
    return { message: 'Password reset successful (stub)' };
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findByVerificationToken(token);
    if (!user) throw new UnauthorizedException('Invalid or expired token');
    await this.usersService.markEmailAsVerified(user.id);
    await this.usersService.clearEmailVerificationToken(user.id);
    return { message: 'Email verified (stub)' };
  }

  async generate2FASecret(userId: number) {
    const secret = speakeasy.generateSecret({ name: 'CurrencyConverterApp' });
    await this.usersService.set2FASecret(userId, secret.base32);
    const qr = await qrcode.toDataURL(secret.otpauth_url!);
    return { otpauth_url: secret.otpauth_url, qr };
  }

  async verify2FACode(userId: number, code: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
    });
    if (!verified) throw new UnauthorizedException('Invalid 2FA code');
    await this.usersService.mark2FAEnabled(userId);
    return { success: true };
  }
} 