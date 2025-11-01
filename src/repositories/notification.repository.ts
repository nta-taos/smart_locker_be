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
}
