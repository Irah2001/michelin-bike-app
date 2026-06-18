import { Test } from '@nestjs/testing';
import { SensorDataService } from './sensor-data.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SensorRecord } from './entities/sensor-record.entity';
import { User } from './entities/user.entity';
import { Tire } from './entities/tire.entity';
import { ChallengeParticipant } from './entities/challenge-participant.entity';
import { Challenge } from './entities/challenge.entity';
import { StravaService } from './strava/strava.service';
import { BadgesService } from './badges.service';

describe('SensorDataService', () => {
  let service: SensorDataService;
  let mockUserRepo: any;
  let mockTireRepo: any;
  let mockRecordRepo: any;
  let mockParticipantRepo: any;
  let mockChallengeRepo: any;

  beforeEach(async () => {
    mockRecordRepo = { create: jest.fn(d => d), save: jest.fn(d => ({ id: 'rec-1', ...d })) };
    mockUserRepo = { findOne: jest.fn(), save: jest.fn(u => u) };
    mockTireRepo = { findOne: jest.fn(), save: jest.fn(t => t) };
    mockParticipantRepo = { find: jest.fn().mockResolvedValue([]), save: jest.fn(p => p) };
    mockChallengeRepo = { save: jest.fn(c => c) };

    const module = await Test.createTestingModule({
      providers: [
        SensorDataService,
        { provide: getRepositoryToken(SensorRecord), useValue: mockRecordRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: getRepositoryToken(Tire), useValue: mockTireRepo },
        { provide: getRepositoryToken(ChallengeParticipant), useValue: mockParticipantRepo },
        { provide: getRepositoryToken(Challenge), useValue: mockChallengeRepo },
        { provide: StravaService, useValue: { getActivities: jest.fn() } },
        { provide: BadgesService, useValue: { checkAndAward: jest.fn().mockResolvedValue([]) } },
      ],
    }).compile();

    service = module.get(SensorDataService);
  });

  describe('create', () => {
    it('should create a sensor record and update user XP', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'u1', xp: 0, level: 1, level_name: 'Rookie', best_distance_km: 0, best_elevation_m: 0 });

      await service.create('u1', { distance_km: 50, elevation_m: 500, avg_speed: 25, duration_seconds: 7200 });

      expect(mockRecordRepo.save).toHaveBeenCalled();
      expect(mockUserRepo.save).toHaveBeenCalledWith(expect.objectContaining({ xp: 500 }));
    });

    it('should update user level when XP threshold is reached', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'u1', xp: 1800, level: 1, level_name: 'Rookie', best_distance_km: 0, best_elevation_m: 0 });

      await service.create('u1', { distance_km: 30, elevation_m: 0, avg_speed: 20, duration_seconds: 3600 });

      // 1800 + 300 = 2100 XP → level 2 Rider
      expect(mockUserRepo.save).toHaveBeenCalledWith(expect.objectContaining({ level: 2, level_name: 'Rider' }));
    });

    it('should update tire wear when tire_id is provided', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'u1', xp: 0, level: 1, level_name: 'Rookie', best_distance_km: 0, best_elevation_m: 0 });
      mockTireRepo.findOne.mockResolvedValue({ id: 't1', total_km: 2000, wear_score: 60, catalog: { expected_lifespan_km: 5000 } });

      await service.create('u1', { distance_km: 100, elevation_m: 0, avg_speed: 25, duration_seconds: 3600, tire_id: 't1' });

      // 2000 + 100 = 2100 km → wear_score = 100 - (2100/5000)*100 = 58
      expect(mockTireRepo.save).toHaveBeenCalledWith(expect.objectContaining({ total_km: 2100, wear_score: 58 }));
    });

    it('should update challenge contributed_km for participants', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'u1', xp: 0, level: 1, level_name: 'Rookie', best_distance_km: 0, best_elevation_m: 0 });
      mockParticipantRepo.find.mockResolvedValue([{
        user_id: 'u1', contributed_km: 100,
        challenge: { id: 'ch1', is_active: true, current_km: 5000, end_date: new Date(Date.now() + 86400000) },
      }]);

      await service.create('u1', { distance_km: 50, elevation_m: 0, avg_speed: 25, duration_seconds: 3600 });

      expect(mockParticipantRepo.save).toHaveBeenCalledWith(expect.objectContaining({ contributed_km: 150 }));
      expect(mockChallengeRepo.save).toHaveBeenCalledWith(expect.objectContaining({ current_km: 5050 }));
    });

    it('should update best_distance when new record', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'u1', xp: 0, level: 1, level_name: 'Rookie', best_distance_km: 80, best_elevation_m: 500 });

      await service.create('u1', { distance_km: 120, elevation_m: 300, avg_speed: 25, duration_seconds: 7200 });

      expect(mockUserRepo.save).toHaveBeenCalledWith(expect.objectContaining({ best_distance_km: 120 }));
    });
  });
});
