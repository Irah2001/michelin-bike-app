import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('status')
  getSystemStatus() {
    return { 
      app: 'Michelin Bike App',
      message: 'API opérationnelle et prête pour les données du capteur ESP32 !', 
      status: 'OK' 
    };
  }
}
