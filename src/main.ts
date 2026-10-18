import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { ConfigType } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { appConfig } from '@config/app/app.config';
import { AppModule } from './app.module';
import { GLOBAL_PREFIX, setupApp } from './app.setup';

const SWAGGER_PATH = 'docs';

async function bootstrap(): Promise<void> {
  const app = setupApp(await NestFactory.create(AppModule));
  const logger = new Logger('Bootstrap');
  const { port } = app.get<ConfigType<typeof appConfig>>(appConfig.KEY);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Ontek EduSmart API')
    .setDescription('School management SaaS API')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();
  SwaggerModule.setup(
    SWAGGER_PATH,
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
    { swaggerOptions: { persistAuthorization: true } },
  );

  await app.listen(port);
  logger.log(`Listening on http://localhost:${port}/${GLOBAL_PREFIX}`);
  logger.log(`Swagger docs on http://localhost:${port}/${SWAGGER_PATH}`);
}
void bootstrap();
