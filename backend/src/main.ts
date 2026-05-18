import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

const WEAK_SECRET = 'tdgenfin-super-secret-jwt-2024-change-me';

function validateEnv() {
  const secret = process.env.JWT_SECRET;
  const nodeEnv = process.env.NODE_ENV;

  if (!secret || secret === WEAK_SECRET) {
    console.error(
      '\n❌  ERRO CRÍTICO: JWT_SECRET não definido ou usando valor padrão inseguro.\n' +
      '    Gere um segredo com: openssl rand -hex 64\n' +
      '    E defina JWT_SECRET no arquivo .env de produção.\n',
    );
    process.exit(1);
  }

  if (nodeEnv === 'production' && !process.env.CORS_ORIGIN) {
    console.error(
      '\n❌  ERRO CRÍTICO: CORS_ORIGIN não definido em produção.\n' +
      '    Defina CORS_ORIGIN=https://seudominio.com no .env de produção.\n',
    );
    process.exit(1);
  }
}

async function bootstrap() {
  validateEnv();

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const corsOrigin = process.env.CORS_ORIGIN;
  app.enableCors({
    // Em produção: apenas a origem configurada. Em dev: qualquer origem.
    origin: corsOrigin ? corsOrigin.split(',').map((o) => o.trim()) : true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Empresa-Id'],
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Application running on: http://localhost:${port}/api/v1`);
}

bootstrap();
