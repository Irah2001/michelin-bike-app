import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class HypertableInitService implements OnModuleInit {
  private readonly logger = new Logger(HypertableInitService.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.dataSource.query(
        `SELECT create_hypertable('sensor_readings', 'time', if_not_exists => TRUE)`,
      );
      await this.dataSource.query(
        `SELECT create_hypertable('ride_readings', 'time', if_not_exists => TRUE)`,
      );
      this.logger.log('TimescaleDB hypertables ready');
    } catch (err) {
      this.logger.warn(`Hypertable init skipped: ${(err as Error).message}`);
    }
  }
}
