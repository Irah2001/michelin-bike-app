import { Test } from '@nestjs/testing';
import { TiresService } from './tires.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Tire } from './entities/tire.entity';
import { Catalog } from './entities/catalog.entity';
import { SensorRecord } from './entities/sensor-record.entity';
import { SensorReading } from './entities/sensor-reading.entity';
import { Ride } from './entities/ride.entity';
import { NotFoundException } from '@nestjs/common';

describe('TiresService', () => {
  let service: TiresService;
  let tireRepo: any;
  let catalogRepo: any;
  let sensorRecordRepo: any;
  let sensorReadingRepo: any;
  let rideRepo: any;

  beforeEach(async () => {
    tireRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn((dto) => dto),
      save: jest.fn((tire) => Promise.resolve({ id: 'tire-1', ...tire })),
    };
    catalogRepo = { findOne: jest.fn() };
    sensorRecordRepo = { find: jest.fn() };
    sensorReadingRepo = { find: jest.fn() };
    rideRepo = { find: jest.fn() };

    const module = await Test.createTestingModule({
      providers: [
        TiresService,
        { provide: getRepositoryToken(Tire), useValue: tireRepo },
        { provide: getRepositoryToken(Catalog), useValue: catalogRepo },
        { provide: getRepositoryToken(SensorRecord), useValue: sensorRecordRepo },
        { provide: getRepositoryToken(SensorReading), useValue: sensorReadingRepo },
        { provide: getRepositoryToken(Ride), useValue: rideRepo },
      ],
    }).compile();

    service = module.get(TiresService);
  });

  describe('findAll', () => {
    it('should return user tires', async () => {
      tireRepo.find.mockResolvedValue([{ id: 'tire-1', wear_score: 80 }]);
      const result = await service.findAll('user-1');
      expect(result).toHaveLength(1);
      expect(tireRepo.find).toHaveBeenCalledWith({ where: { user_id: 'user-1' }, relations: { catalog: true } });
    });
  });

  describe('create', () => {
    it('should create tire if catalog exists', async () => {
      catalogRepo.findOne.mockResolvedValue({ id: 'cat-1', name: 'Power Road' });
      const result = await service.create('user-1', { catalog_id: 'cat-1' });
      expect(result.catalog_id).toBe('cat-1');
    });

    it('should throw NotFoundException if catalog not found', async () => {
      catalogRepo.findOne.mockResolvedValue(null);
      await expect(service.create('user-1', { catalog_id: 'fake' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update total_km and recalculate wear_score', async () => {
      tireRepo.findOne.mockResolvedValue({ id: 'tire-1', user_id: 'user-1', total_km: 0, wear_score: 100 });
      const result = await service.update('tire-1', 'user-1', { total_km: 2500 });
      expect(result.total_km).toBe(2500);
      expect(result.wear_score).toBe(50);
    });

    it('should throw NotFoundException if tire not found', async () => {
      tireRepo.findOne.mockResolvedValue(null);
      await expect(service.update('fake', 'user-1', { total_km: 100 })).rejects.toThrow(NotFoundException);
    });
  });
});
