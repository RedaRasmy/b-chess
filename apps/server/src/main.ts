import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ConsoleLogger, StandardSchemaValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        bodyParser: false,
        logger: new ConsoleLogger({
            // logLevels: ['log'],
        }),
    });

    app.use(helmet());

    app.use(cookieParser());

    app.useGlobalPipes(new StandardSchemaValidationPipe());

    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });
    await app.listen(process.env.PORT ?? 3333);
}

bootstrap().catch((err) => {
    console.error('Nest application failed to start', err);
    process.exit(1);
});
