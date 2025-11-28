import dotenv from 'dotenv'

dotenv.config()

export const ENV = process.env.NODE_ENV ?? 'development'

export const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000'
export const UPLOAD_FOLDER = process.env.UPLOAD_FOLDER || '/uploads'
export const CLIENT_BASE_URL = process.env.CLIENT_BASE_URL || 'http://localhost:5173'

export const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASS || undefined,
  db: Number(process.env.REDIS_DB) || 0,
  defaultTTL: Number(process.env.REDIS_TTL) || 3600,
  maxRetry: Number(process.env.REDIS_MAX_RETRY) || 5
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

export const MQTT_CONFIG = {
  brokerUrl: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
  username: process.env.MQTT_USERNAME || '',
  password: process.env.MQTT_PASSWORD || ''
}

export const PAYOS_CONFIG = {
  clientId: process.env.PAYOS_CLIENT_ID || '',
  apiKey: process.env.PAYOS_API_KEY || '',
  checksumKey: process.env.PAYOS_CHECKSUM_KEY || '',
  returnUrl: `${CLIENT_BASE_URL}/wallet/success`,
  cancelUrl: `${CLIENT_BASE_URL}/wallet/cancel`,
  timeout: Number(process.env.PAYOS_TIMEOUT) || 5000
}
