import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import * as morgan from 'morgan';
import { NotAcceptableException, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (process.env?.NODE_ENV?.trim() === 'development') {
    app.use(morgan('tiny'));
  }

  app.setGlobalPrefix('/api');

  app.enableCors({
    allowedHeaders: ['authorization', 'content-type'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    origin: (reqOrigin, cb) => {
      const allowedOrigins = process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',')
        : ['*'];
      if (allowedOrigins.includes(reqOrigin) || allowedOrigins.includes('*')) {
        return cb(null, reqOrigin);
      } else {
        cb(
          new NotAcceptableException(
            `${reqOrigin} ga so'rov yuborishga ruhsat yo'q`,
          ),
        );
      }
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Users API')
    .setDescription('The users API description')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        name: 'Authorization',
      },
      'access-token', 
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true, 
    },
  });

  const port = process.env.APP_PORT ? parseInt(process.env.APP_PORT) : 3000;
  await app.listen(port, () => {
    console.log(`listening on ${port}`);
  });
}

bootstrap();
