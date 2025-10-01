import { inject, injectable } from 'inversify'
import { Server as SocketIOServer, Socket } from 'socket.io'

import { UserRole } from '@/common/enum/role.enum'
import { verifyToken } from '@/common/utils/jwt'
import TYPES from '@/di/types'
import { UserRepository } from '@/repositories/user.repository'

@injectable()
class SocketService {
  private socketClients: Map<number, Set<string>> = new Map()

  constructor(
    @inject(TYPES.SocketServer) private io: SocketIOServer,
    @inject(TYPES.UserRepository) private userRepository: UserRepository
  ) {
    this.initialize()
  }

  private initialize() {
    this.io.on('connection', async (socket: Socket) => {
      const token = socket.handshake.auth?.token
      if (!token) {
        console.log('❌ No token provided')
        socket.disconnect()
        return
      }

      try {
        const payload = verifyToken(token)
        const userId = Number(payload.sub)

        const user = await this.userRepository.findOneByCondition({ id: userId }, { relations: ['building'] })

        if (!user) {
          console.log(`❌ User ${userId} not found`)
          socket.disconnect()
          return
        }

        if (!this.socketClients.has(userId)) {
          this.socketClients.set(userId, new Set())
        }
        this.socketClients.get(userId)?.add(socket.id)
        console.log(`✅ User ${userId} connected with socketId=${socket.id}`)

        if (user.building?.id) {
          socket.join(`building:${user.building.id}`)
        }
        if (user.building?.isPublic) {
          socket.join('publicBuilding')
        }
        if (user.role === UserRole.SHIPPER) {
          socket.join('shipper')
        }

        socket.on('disconnect', () => {
          const sockets = this.socketClients.get(userId)
          if (sockets) {
            sockets.delete(socket.id)
            if (sockets.size === 0) {
              this.socketClients.delete(userId)
              console.log(`❌ User ${userId} disconnected (all devices offline)`)
            } else {
              console.log(`⚠️ User ${userId} disconnected socketId=${socket.id}, still has ${sockets.size} active`)
            }
          }
        })
      } catch (err) {
        console.log('❌ Invalid token:', err)
        socket.disconnect()
      }
    })
  }

  /**
   * Emit đến toàn bộ client
   */
  public emitToAll<T>(event: string, payload: T): void {
    this.io.emit(event, payload)
  }

  /**
   * Emit đến toàn bộ client trừ 1 user
   */
  public emitToAllExcept<T>(excludedUserId: number, event: string, payload: T): void {
    const socketIds = this.socketClients.get(excludedUserId)
    if (socketIds && socketIds.size > 0) {
      this.io.except(Array.from(socketIds)).emit(event, payload)
    } else {
      this.io.emit(event, payload)
    }
  }

  /**
   * Emit đến 1 user cụ thể
   */
  public emitToUser<T>(userId: number, event: string, payload: T): void {
    const socketIds = this.socketClients.get(userId)
    if (socketIds && socketIds.size > 0) {
      socketIds.forEach((socketId) => {
        this.io.to(socketId).emit(event, payload)
      })
    } else {
      console.warn(`⚠️ User ${userId} không online, không gửi được event ${event}`)
    }
  }

  /**
   * Emit đến nhiều user
   */
  public emitToUsers<T>(userIds: number[], event: string, payload: T): void {
    userIds.forEach((id) => this.emitToUser(id, event, payload))
  }

  /**
   * Emit đến 1 room
   */
  public emitToRoom<T>(room: string, event: string, payload: T): void {
    this.io.to(room).emit(event, payload)
  }

  /**
   * Cho user join room
   */
  public addUserToRoom(userId: number, room: string): void {
    const socketIds = this.socketClients.get(userId)
    if (socketIds && socketIds.size > 0) {
      socketIds.forEach((socketId) => {
        const socket = this.io.sockets.sockets.get(socketId)
        socket?.join(room)
      })
      console.log(`✅ User ${userId} joined room ${room} (${socketIds.size} devices)`)
    } else {
      console.warn(`⚠️ User ${userId} không online, không join được room ${room}`)
    }
  }

  /**
   * Cho user rời room
   */
  public removeUserFromRoom(userId: number, room: string): void {
    const socketIds = this.socketClients.get(userId)
    if (socketIds && socketIds.size > 0) {
      socketIds.forEach((socketId) => {
        const socket = this.io.sockets.sockets.get(socketId)
        socket?.leave(room)
      })
      console.log(`✅ User ${userId} left room ${room} (${socketIds.size} devices)`)
    } else {
      console.warn(`⚠️ User ${userId} không online, không leave được room ${room}`)
    }
  }

  /**
   * Kiểm tra user có online không
   */
  public isUserOnline(userId: number): boolean {
    const socketIds = this.socketClients.get(userId)
    return !!(socketIds && socketIds.size > 0)
  }

  /**
   * Lấy socketId theo userId
   */
  public getSocketIdsByUser(userId: number): string[] {
    const socketIds = this.socketClients.get(userId)
    return socketIds ? Array.from(socketIds) : []
  }

  /**
   * Lấy toàn bộ client đang kết nối
   */
  public listConnectedClients(): { userId: number; socketId: string }[] {
    const clients: { userId: number; socketId: string }[] = []
    this.socketClients.forEach((socketIds, userId) => {
      socketIds.forEach((socketId) => {
        clients.push({ userId, socketId })
      })
    })
    console.log('🔗 Danh sách client online:', clients)
    return clients
  }
}

export default SocketService
