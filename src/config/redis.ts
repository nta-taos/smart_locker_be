import Redis from 'ioredis'

import { REDIS_CONFIG } from './config'

class RedisService {
  private static instance: RedisService
  private client: Redis
  private defaultTTL = 3600
  private maxRetry = 5

  private constructor() {
    this.client = new Redis({
      host: REDIS_CONFIG.host,
      port: REDIS_CONFIG.port,
      password: REDIS_CONFIG.password,
      retryStrategy: (times) => {
        if (times > this.maxRetry) return null
        const delay = Math.min(times * 2000, 60000)
        console.log(`Redis retry #${times}, next attempt in ${delay}ms`)
        return delay
      }
    })

    this.client.on('connect', () => console.log('Redis connected'))
    this.client.on('ready', () => console.log('Redis ready'))
    this.client.on('error', (err) => console.error('Redis error', err))
    this.client.on('close', () => console.log('Redis connection closed'))
    this.client.on('reconnecting', (times: number) => console.log(`Redis reconnecting, attempt #${times}`))
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService()
    }
    return RedisService.instance
  }

  async setCache(key: string, value: unknown, ttlSeconds?: number) {
    const data = typeof value === 'string' ? value : JSON.stringify(value)
    await this.client.set(key, data, 'EX', ttlSeconds || this.defaultTTL)
  }

  async getCache<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key)
    if (!data) return null
    try {
      return JSON.parse(data) as T
    } catch {
      return data as unknown as T
    }
  }

  async delCache(key: string) {
    await this.client.del(key)
  }

  async safeSetCache(key: string, value: unknown, ttlSeconds?: number) {
    try {
      await this.setCache(key, value, ttlSeconds)
    } catch (err) {
      console.error(`Redis safeSetCache error for key "${key}":`, err)
    }
  }

  async safeGetCache<T>(key: string): Promise<T | null> {
    try {
      return await this.getCache<T>(key)
    } catch (err) {
      console.error(`Redis safeGetCache error for key "${key}":`, err)
      return null
    }
  }

  getClient() {
    return this.client
  }
}

export const redisService = RedisService.getInstance()
