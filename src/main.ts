import helmet from 'helmet'
import { Logger, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AdminsModule } from './modules/aggregators/admins/admins.module'
import { ExternalsModule } from './modules/aggregators/externals/externals.module'
import { getServerIP } from './utils/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors()
  app.use(helmet())
  app.useGlobalPipes(new ValidationPipe())

  // Kafka

  // Logger

  // Monitor

  // Swagger

  const adminOptions = new DocumentBuilder()
    .setTitle('Admin Payment Gateway Swagger')
    .setDescription('The Admin API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const adminDocument = SwaggerModule.createDocument(app, adminOptions, {
    include: [AdminsModule]
  })
  SwaggerModule.setup('swagger-admin', app, adminDocument)

  const options = new DocumentBuilder()
    .setTitle('Payment Gateway Swagger')
    .setDescription('The API description')
    .setVersion('1.0')
    .build()

  const document = SwaggerModule.createDocument(app, options, {
    include: [ExternalsModule]
  })
  SwaggerModule.setup('swagger', app, document)

  await app.listen('8080')

  const logger = new Logger('Main')

  logger.log(`REST port: 8080`)
  logger.log(`Server IP: ${await getServerIP()}`)
}
bootstrap()
