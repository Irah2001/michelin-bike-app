import { Controller, Post, NotImplementedException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  @Post('register')
  @ApiOperation({ summary: '🚧 Inscription email/password' })
  register() {
    throw new NotImplementedException();
  }

  @Post('login')
  @ApiOperation({ summary: '🚧 Connexion email/password' })
  login() {
    throw new NotImplementedException();
  }
}
