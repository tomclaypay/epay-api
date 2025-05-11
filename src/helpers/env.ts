export function getEnvFilePath(nodeEnv = 'development') {
  return nodeEnv === 'development'
    ? ['.env', '.env.development', '.env.development.local']
    : [`.env.${nodeEnv}`, `.env.${nodeEnv}.local`, '.env']
}
