import { Controller, Get, Query, Headers, Param, Redirect } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { StravaService } from './strava.service';

@Controller('strava')
export class StravaController {
  constructor(
    private readonly stravaService: StravaService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('login')
  @Redirect()
  login() {
    return { url: this.stravaService.getAuthUrl() };
  }

  @Get('callback')
  async callback(@Query('code') code: string) {
    const tokenData = await this.stravaService.exchangeToken(code);
    const user = await this.stravaService.findOrCreateUser(tokenData);
    const access_token = this.jwtService.sign({ sub: user.id, email: user.email });
    return {
      user: { id: user.id, name: user.name, email: user.email, avatar_url: user.avatar_url },
      access_token,
    };
  }

  @Get('refresh')
  async refresh(@Query('refresh_token') refreshToken: string) {
    return this.stravaService.refreshToken(refreshToken);
  }

  @Get('athlete')
  async getAthlete(@Headers('authorization') auth: string) {
    const token = auth?.replace('Bearer ', '');
    return this.stravaService.getAthlete(token);
  }

  @Get('activities')
  async getActivities(@Headers('authorization') auth: string) {
    const token = auth?.replace('Bearer ', '');
    return this.stravaService.getActivities(token);
  }

  @Get('stats/:athleteId')
  async getStats(
    @Headers('authorization') auth: string,
    @Param('athleteId') athleteId: number,
  ) {
    const token = auth?.replace('Bearer ', '');
    return this.stravaService.getStats(token, athleteId);
  }
}
