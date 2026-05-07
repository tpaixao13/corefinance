import { Controller, Post, Body, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto, @Req() req: Request) {
    const ipAddress = req.ip ?? (req.socket?.remoteAddress);
    return this.authService.login(dto, ipAddress);
  }
}
