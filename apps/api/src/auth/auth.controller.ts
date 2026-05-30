import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyMfaDto, LoginMfaDto } from './dto/mfa.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Request() req: ExpressRequest & { user?: any }) {
    return req.user ?? null;
  }

  // --- MFA ENDPOINTS ---

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('mfa/enroll')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enroll in TOTP MFA (generates secret and QR URI)' })
  @ApiResponse({ status: 200, description: 'MFA enrolled successfully' })
  enrollMfa(@Request() req: ExpressRequest & { user: any }) {
    return this.authService.enrollMfa(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify MFA enrollment and receive recovery codes' })
  @ApiResponse({
    status: 200,
    description: 'MFA verified and enabled successfully',
  })
  verifyMfa(
    @Request() req: ExpressRequest & { user: any },
    @Body() verifyMfaDto: VerifyMfaDto,
  ) {
    return this.authService.verifyMfa(req.user.id, verifyMfaDto.code);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('mfa/disable')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disable MFA' })
  @ApiResponse({ status: 200, description: 'MFA disabled successfully' })
  disableMfa(
    @Request() req: ExpressRequest & { user: any },
    @Body() verifyMfaDto: VerifyMfaDto,
  ) {
    return this.authService.disableMfa(req.user.id, verifyMfaDto.code);
  }

  @Post('mfa/login-verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify MFA during login process' })
  @ApiResponse({
    status: 200,
    description: 'MFA successfully verified, final token returned',
  })
  loginVerifyMfa(@Body() loginMfaDto: LoginMfaDto) {
    return this.authService.loginVerifyMfa(
      loginMfaDto.mfaToken,
      loginMfaDto.code,
    );
  }

  // --- OIDC SSO ENDPOINTS ---

  @Get('sso/oidc/login')
  @ApiOperation({ summary: 'Get OIDC login redirection URL' })
  getOidcLoginUrl(
    @Query('tenantId') tenantId: string,
    @Query('provider') provider: string,
    @Query('redirectUri') redirectUri: string,
  ) {
    return this.authService.getOidcLoginUrl(
      tenantId || 'mock-tenant',
      provider || 'google',
      redirectUri || 'http://localhost:3000/auth/sso/callback',
    );
  }

  @Get('sso/oidc/callback')
  @ApiOperation({
    summary: 'Handle OIDC redirect callback and return final token',
  })
  handleOidcCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('redirectUri') redirectUri: string,
  ) {
    // Parse tenantId and provider from state (format: "tenantId:provider")
    const parts = (state || '').split(':');
    const tenantId = parts[0] || 'mock-tenant';
    const provider = parts[1] || 'google';

    return this.authService.handleOidcCallback(
      tenantId,
      provider,
      code || 'mock-code',
      redirectUri || 'http://localhost:3000/auth/sso/callback',
    );
  }
}
