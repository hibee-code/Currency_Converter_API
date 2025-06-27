import { Controller, Post, Body, UnauthorizedException, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, description: 'JWT access token returned.' })
  @UseGuards(ThrottlerGuard)
  @Throttle({ limit: 5, ttl: 60 }) // 5 requests per minute
  @Post('login')
  async login(@Body() body: { email: string; password: string; code?: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (user.is2FAEnabled) {
      if (!body.code) {
        return { requires2FA: true, message: '2FA code required' };
      }
      const verified = await this.authService.verify2FACode(user.id, body.code);
      if (!verified.success) throw new UnauthorizedException('Invalid 2FA code');
    }
    return this.authService.login(user);
  }

  @ApiOperation({ summary: 'Request password reset email' })
  @ApiResponse({ status: 201, description: 'Password reset email sent.' })
  @UseGuards(ThrottlerGuard)
  @Throttle({ limit: 3, ttl: 60 }) // 3 requests per minute
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.sendPasswordResetEmail(dto.email);
  }

  @ApiOperation({ summary: 'Reset password' })
  @ApiResponse({ status: 200, description: 'Password reset successful.' })
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @ApiOperation({ summary: 'Verify email' })
  @ApiResponse({ status: 200, description: 'Email verified.' })
  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Setup 2FA' })
  @ApiResponse({ status: 200, description: '2FA secret and QR code returned.' })
  @UseGuards(JwtAuthGuard)
  @Post('2fa/setup')
  async setup2FA(@Request() req: Request) {
    if (!('user' in req) || !req.user) throw new UnauthorizedException();
    return this.authService.generate2FASecret((req as any).user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify 2FA code' })
  @ApiResponse({ status: 200, description: '2FA verified.' })
  @UseGuards(JwtAuthGuard)
  @Post('2fa/verify')
  async verify2FA(@Request() req: Request, @Body() body: { code: string }) {
    if (!('user' in req) || !req.user) throw new UnauthorizedException();
    return this.authService.verify2FACode((req as any).user.id, body.code);
  }

  @ApiOperation({ summary: 'User signup' })
  @ApiResponse({ status: 201, description: 'User registered.' })
  @UseGuards(ThrottlerGuard)
  @Throttle({ limit: 3, ttl: 60 }) // 3 requests per minute
  @Post('signup')
  async signup(@Body() createUserDto: any) {
    // You may want to move signup here for rate limiting, or add similar logic to UsersController
    return { message: 'Signup endpoint (implement logic or move from UsersController)' };
  }
} 