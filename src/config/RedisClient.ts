import Redis from 'ioredis'

import { REDIS_CONFIG } from './config'

class RedisClient {
  private client: Redis

  constructor() {
    this.client = new Redis({
      host: REDIS_CONFIG.host,
      port: Number(REDIS_CONFIG.port),
      password: REDIS_CONFIG.password,
      db: Number(REDIS_CONFIG.db),
      retryStrategy: (times) => Math.min(times * 50, 2000)
    })

    this.client.on('connect', () => console.log('✅ Redis connected!'))
    this.client.on('error', (err) => console.error('❌ Redis error:', err))
  }

  public async connect(): Promise<void> {
    await this.client.ping()
  }

  public async get(key: string): Promise<string | null> {
    return this.client.get(key)
  }

  public async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.set(key, value, 'EX', ttl)
    } else {
      await this.client.set(key, value)
    }
  }

  public async del(key: string): Promise<void> {
    await this.client.del(key)
  }

  public getClient(): Redis {
    return this.client
  }
}

export default new RedisClient()
