import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class StravaService {
  constructor(private config: ConfigService) {}

  getAuthUrl(): string {
    const clientId = this.config.get('STRAVA_CLIENT_ID');
    const redirectUri = this.config.get('STRAVA_REDIRECT_URI');
    return (
      `https://www.strava.com/oauth/authorize` +
      `?client_id=${clientId}` +
      `&redirect_uri=${redirectUri}` +
      `&response_type=code` +
      `&scope=read,activity:read_all`
    );
  }

  async exchangeToken(code: string) {
    const { data } = await axios.post('https://www.strava.com/oauth/token', {
      client_id: this.config.get('STRAVA_CLIENT_ID'),
      client_secret: this.config.get('STRAVA_CLIENT_SECRET'),
      code,
      grant_type: 'authorization_code',
    });
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      athlete: data.athlete,
    };
  }

  async refreshToken(refreshToken: string) {
    const { data } = await axios.post('https://www.strava.com/oauth/token', {
      client_id: this.config.get('STRAVA_CLIENT_ID'),
      client_secret: this.config.get('STRAVA_CLIENT_SECRET'),
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
    };
  }

  async getAthlete(accessToken: string) {
    const { data } = await axios.get('https://www.strava.com/api/v3/athlete', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return data;
  }

  async getActivities(accessToken: string, perPage = 30) {
    const { data } = await axios.get(
      `https://www.strava.com/api/v3/athlete/activities?per_page=${perPage}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const rides = data.filter((a: any) =>
      ['Ride', 'VirtualRide'].includes(a.type),
    );
    return rides.length > 0 ? rides : data.filter((a: any) => a.type === 'Run');
  }

  async getStats(accessToken: string, athleteId: number) {
    const { data } = await axios.get(
      `https://www.strava.com/api/v3/athletes/${athleteId}/stats`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    return data;
  }
}
