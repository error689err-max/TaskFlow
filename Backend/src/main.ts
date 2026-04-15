import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { AppModule } from './app.module';
import config from './config/env.config';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule);

    const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        config.FRONTEND_URL,
    ].filter(Boolean);

    app.enableCors({
        origin: allowedOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    app.use(cookieParser());
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    try {
        const openApiDocument = JSON.parse(
            readFileSync(
                join(process.cwd(), 'openapi', 'taskflow.swagger.json'),
                'utf-8',
            ),
        );

        SwaggerModule.setup('api-docs', app, openApiDocument, {
            jsonDocumentUrl: 'api-docs/json',
            customSiteTitle: 'TaskFlow API Docs',
        });
    } catch (error) {
        logger.warn(
            'Skipping Swagger setup: openapi/taskflow.swagger.json missing or invalid JSON',
        );
        logger.debug(error);
    }
    app.setGlobalPrefix('api');
    await app.listen(config.PORT);
}
bootstrap();
