import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const FRONTURL = process.env.FRONTEND_URL || 'http://localhost:3001';

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.enableCors({
    origin: FRONTURL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const swaggerDoc = new DocumentBuilder()
    .setTitle('Montevino Restaurante')
    .setDescription('Montevino restaurante gourmet')
    .addBearerAuth()
    .build();

  const swaggerModule = SwaggerModule.createDocument(app, swaggerDoc);
  SwaggerModule.setup('docs', app, swaggerModule);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
