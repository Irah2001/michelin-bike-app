import { Test } from '@nestjs/testing';
import { ChallengesService } from './challenges.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Challenge } from './entities/challenge.entity';
import { ChallengeParticipant } from './entities/challenge-participant.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('ChallengesService', () => {
  let service: ChallengesService;
  let challengeRepo: any;
  let participantRepo: any;

  beforeEach(async () => {
    challengeRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn((dto) => dto),
      save: jest.fn((c) => Promise.resolve({ id: 'ch-1', ...c })),
    };
    participantRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn((dto) => dto),
      save: jest.fn((p) => Promise.resolve(p)),
    };

    const module = await Test.createTestingModule({
      providers: [
        ChallengesService,
        { provide: getRepositoryToken(Challenge), useValue: challengeRepo },
        { provide: getRepositoryToken(ChallengeParticipant), useValue: participantRepo },
      ],
    }).compile();

    service = module.get(ChallengesService);
  });

  describe('findAll', () => {
    it('should return active challenges', async () => {
      challengeRepo.find.mockResolvedValue([{ id: 'ch-1', title: 'Test' }]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('should create challenge and auto-join creator', async () => {
      const result = await service.create('user-1', {
        title: '100km', target_km: 100, start_date: '2026-07-01', end_date: '2026-07-31',
      });
      expect(result.title).toBe('100km');
      expect(participantRepo.save).toHaveBeenCalled();
    });
  });

  describe('join', () => {
    it('should join a challenge', async () => {
      challengeRepo.findOne.mockResolvedValue({ id: 'ch-1' });
      participantRepo.findOne.mockResolvedValue(null);
      await service.join('ch-1', 'user-2');
      expect(participantRepo.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if challenge not found', async () => {
      challengeRepo.findOne.mockResolvedValue(null);
      await expect(service.join('fake', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if already joined', async () => {
      challengeRepo.findOne.mockResolvedValue({ id: 'ch-1' });
      participantRepo.findOne.mockResolvedValue({ user_id: 'user-1' });
      await expect(service.join('ch-1', 'user-1')).rejects.toThrow(ConflictException);
    });
  });

  describe('leaderboard', () => {
    it('should return ranked participants', async () => {
      participantRepo.find.mockResolvedValue([
        { user_id: 'u1', contributed_km: 50, user: { name: 'Alice', avatar_url: null } },
        { user_id: 'u2', contributed_km: 30, user: { name: 'Bob', avatar_url: null } },
      ]);
      const result = await service.leaderboard('ch-1');
      expect(result[0].rank).toBe(1);
      expect(result[0].name).toBe('Alice');
      expect(result[1].rank).toBe(2);
    });
  });
});
