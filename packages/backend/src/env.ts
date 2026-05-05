import 'dotenv/config'

export const env = {
  DATABASE_URL: process.env.DATABASE_URL ?? '',
  PORT: Number(process.env.PORT ?? 3001),
  FRONTEND_URL: process.env.FRONTEND_URL ?? '*',
}

if (!env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required')
}
