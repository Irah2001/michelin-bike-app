import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
  
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  
  const swaggerOptions = new DocumentBuilder()
    .setTitle('Michelin Bike API')
    .setDescription('API for managing Michelin bikes')
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
