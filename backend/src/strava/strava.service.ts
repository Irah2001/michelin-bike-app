import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { User } from '../entities/user.entity';

@Injectable()
export class StravaService {
  constructor(
    private config: ConfigService,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

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

  async findOrCreateUser(tokenData: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    athlete: any;
  }): Promise<User> {
    const { athlete, access_token, refresh_token, expires_at } = tokenData;

    let user = await this.userRepo.findOne({
      where: { strava_id: String(athlete.id) },
    });

    if (user) {
      // Met à jour les tokens
      user.strava_access_token = access_token;
      user.strava_refresh_token = refresh_token;
      user.strava_token_expires_at = String(expires_at);
      if (athlete.profile) user.avatar_url = athlete.profile;
    } else {
      // Crée un nouvel utilisateur
      user = this.userRepo.create({
        strava_id: String(athlete.id),
        strava_access_token: access_token,
        strava_refresh_token: refresh_token,
        strava_token_expires_at: String(expires_at),
        name: `${athlete.firstname} ${athlete.lastname}`,
        email: athlete.email || `strava_${athlete.id}@placeholder.com`,
        password_hash: '',
        avatar_url: athlete.profile || null,
        region: athlete.city || null,
      });
    }

    return this.userRepo.save(user);
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
