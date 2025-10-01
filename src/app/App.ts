import cors from 'cors'
import type { Application, Request, Response, NextFunction } from 'express'
import express from 'express'
import http from 'http'
import { StatusCodes } from 'http-status-codes'
import morgan from 'morgan'
import path from 'path'
import { Server as SocketIOServer } from 'socket.io'

import { errorHandler } from '@/common/middleware/error-handling.middleware'
import { ENV } from '@/config/config'
import { container } from '@/di/container'
import TYPES from '@/di/types'
import { MQTTService } from '@/services/mqtt.service'
import SocketService from '@/services/socket.service'

import { ApiError } from '../common/responses/api-error'
import { AppDataSource } from '../config/mysql'
import { redisService } from '../config/redis'
import routes from '../routes/index'

class App {
  public app: Application
  public server: http.Server
  public io: SocketIOServer

  constructor() {
    this.app = express()
    this.server = http.createServer(this.app)
    this.io = new SocketIOServer(this.server, { cors: { origin: '*' } })

    container.get<MQTTService>(TYPES.MQTTService)
    this.plugins()
    this.databaseSync()
    this.cacheConnect()
    this.initSocketIo()
    this.routes()
    this.catchError()
  }

  private async databaseSync(): Promise<void> {
    AppDataSource.initialize()
      .then(() => console.log('Database connected!'))
      .catch((err) => console.error('Error connecting to DB', err))
  }

  private async cacheConnect(): Promise<void> {
    try {
      await redisService
    } catch (error) {
      console.error('❌ Redis connection error:', error)
    }
  }

  private routes(): void {
    this.app.use('/api', routes)
    this.app.use('/uploads', express.static(path.join(__dirname, '../../uploads')))
  }

  private plugins(): void {
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))
    this.app.use(cors())
    if (ENV === 'development') {
      this.app.use(morgan('dev'))
    } else if (ENV === 'production') {
      this.app.use(morgan('combined'))
    }
  }

  private initSocketIo(): void {
    container.bind<SocketIOServer>(TYPES.SocketServer).toConstantValue(this.io)
    container.get<SocketService>(TYPES.SocketService)
  }

  private catchError(): void {
    this.app.all('*', (req: Request, res: Response, next: NextFunction) => {
      next(new ApiError(StatusCodes.NOT_FOUND, `Can't find ${req.originalUrl} on this server!`))
    })
    this.app.use(errorHandler)
  }
}

export default new App()
