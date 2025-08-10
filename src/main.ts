import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api'); //for routing to deploy vercel
  //globally make validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //to ensure if any property not exist in you Dto , it will not taken to controller
      forbidNonWhitelisted: true, //it forbids additional property , throw an error
      transform: true, // transfrom incoming request to instace of dto class after validation
    }),
  );

  //Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('MCG CARE Aircon Service')
    .setDescription('Use the base API URL as http://localhost:3000')
    .setTermsOfService('http://localhost:3000/terms-of-service')
    .setLicense('MIT License', 'https://github.com')
    // .addServer('http://localhost:3000')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'bearer-token',
    )
    .build();

  //Instantiate Document
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    jsonDocumentUrl: 'swagger-json',
    swaggerOptions: {
      operationsSorter: 'method',
    },
  });

  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
