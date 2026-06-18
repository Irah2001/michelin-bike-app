import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: any;
  let jwtService: any;

  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      create: jest.fn((dto) => dto),
      save: jest.fn((user) => Promise.resolve({ ...user, id: 'uuid-1' })),
    };
    jwtService = { sign: jest.fn(() => 'mocked-jwt-token') };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('register', () => {
    it('should create user and return token', async () => {
      userRepo.findOne.mockResolvedValue(null);
      const result = await service.register('test@test.com', '123456', 'Test');
      expect(result).toEqual({ access_token: 'mocked-jwt-token' });
      expect(userRepo.save).toHaveBeenCalled();
      expect(jwtService.sign).toHaveBeenCalled();
    });

    it('should throw ConflictException if email exists', async () => {
      userRepo.findOne.mockResolvedValue({ id: 'exists' });
      await expect(service.register('test@test.com', '123456', 'Test')).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return token for valid credentials', async () => {
      const hash = await bcrypt.hash('123456', 10);
      userRepo.findOne.mockResolvedValue({ id: 'uuid-1', email: 'test@test.com', password_hash: hash });
      const result = await service.login('test@test.com', '123456');
      expect(result).toEqual({ access_token: 'mocked-jwt-token' });
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const hash = await bcrypt.hash('123456', 10);
      userRepo.findOne.mockResolvedValue({ id: 'uuid-1', email: 'test@test.com', password_hash: hash });
      await expect(service.login('test@test.com', 'wrong')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for unknown email', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(service.login('unknown@test.com', '123456')).rejects.toThrow(UnauthorizedException);
    });
  });
});
