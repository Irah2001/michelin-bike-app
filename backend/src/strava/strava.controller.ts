import { Controller, Get, Query, Headers, Param, Redirect } from '@nestjs/common';
import { StravaService } from './strava.service';

@Controller('strava')
export class StravaController {
  constructor(private readonly stravaService: StravaService) {}

  @Get('login')
  @Redirect()
  login() {
    return { url: this.stravaService.getAuthUrl() };
  }

  @Get('callback')
  async callback(@Query('code') code: string) {
    return this.stravaService.exchangeToken(code);
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
