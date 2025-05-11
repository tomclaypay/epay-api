import { getEnvFilePath } from '@/helpers'
import { ConfigModule } from '@nestjs/config'
import { validationOptions, validationSchema } from './env.validation'

export function loadConfig() {
  return ConfigModule.forRoot({
    validationOptions,
    validationSchema,
    isGlobal: true,
    envFilePath: getEnvFilePath(process.env.NODE_ENV)
  })
}

export default loadConfig
