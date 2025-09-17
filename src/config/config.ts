import dotenv from 'dotenv'

dotenv.config()

export const ENV = process.env.NODE_ENV ?? 'development'

export const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000'
export const UPLOAD_FOLDER = process.env.UPLOAD_FOLDER || '/uploads'

export const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASS || undefined,
  db: Number(process.env.REDIS_DB) || 0
}

export const MYSQL_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || 'test',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || ''
}

export const JWT_CONFIG = {
  secretKey: process.env.JWT_SECRET_KEY || 'default_secret_key',
  expiresIn: process.env.JWT_EXPIRES_IN || '1d'
}
