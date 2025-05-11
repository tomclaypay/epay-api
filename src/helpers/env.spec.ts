import { getEnvFilePath } from './env'

describe('helpers/env.ts', () => {
  describe('getEnvFilePath', () => {
    it('should have default development env', () => {
      expect(getEnvFilePath()).toStrictEqual([
        '.env',
        '.env.development',
        '.env.development.local'
      ])
    })

    it('should return env exactly', () => {
      for (const env of ['testing', 'staging', 'production']) {
        expect(getEnvFilePath(env)).toStrictEqual([
          `.env.${env}`,
          `.env.${env}.local`,
          '.env'
        ])
      }
    })
  })
})
