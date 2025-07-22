import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global API Prefix
  app.setGlobalPrefix('api');

  // Global Validation
  // app.useGlobalPipes(
  //   new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  // );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      stopAtFirstError: true,
      // 👇 enables error messages
      enableDebugMessages: true,
    }),
  );

  // CORS Configuration
  app.enableCors({
    origin: [
      'http://localhost:5173', // Vite/React frontend
      'http://localhost:3001', // optional second frontend
      'https://admin.nnact.com', // the production frontend
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Swagger Setup
  const config = new DocumentBuilder()
    .setTitle('NNACT API')
    .setDescription(
      'API documentation for the NNACT Home Appliance Repairs and Maintenance system.',
    )
    .setVersion('1.0')
    .addTag('NNACT')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const PORT = process.env.PORT;
  await app.listen(process.env.PORT);

  console.log(`🚀 NNACT API is running at http://localhost:${PORT}/api`);
  console.log(`📘 Swagger Docs available at http://localhost:${PORT}/api/docs`);
}

bootstrap();
