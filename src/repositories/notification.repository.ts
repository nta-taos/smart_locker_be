// src/repositories/notification.repository.ts

import { injectable } from 'inversify'

import { Notification } from '@/entities/notification.model' // Giả định path

import { BaseRepository } from './base.repository'
import { INotificationRepository } from './notification.repository.interface'

@injectable()
export class NotificationRepository extends BaseRepository<Notification> implements INotificationRepository {
  constructor() {
    super(Notification)
  }

  async markAllAsRead(userId: number): Promise<number> {
    const result = await this.repository
      .createQueryBuilder()
      .update()
      .set({ isRead: true })
      .where('userId = :userId AND isRead = :isRead', { userId, isRead: false })
      .execute()

    return result.affected ?? 0
  }
}
