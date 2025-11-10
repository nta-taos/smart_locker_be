import autoBind from 'auto-bind'
import { injectable, inject } from 'inversify'
import type { FindManyOptions } from 'typeorm'

import { ErrorMessages } from '@/common/constants/messages'
import { ApiError } from '@/common/responses'
import TYPES from '@/di/types'
import { Notification } from '@/entities/notification.model'
import { NotificationRepository } from '@/repositories/notification.repository'

interface NotificationPaginationResult {
  data: Notification[]
  total: number
  totalPages: number
  unreadCount: number
  page: number
  limit: number
}

@injectable()
export class NotificationService {
  constructor(
    @inject(TYPES.NotificationRepository)
    private readonly notificationRepository: NotificationRepository
  ) {
    autoBind(this)
  }

  /**
   * Lấy danh sách tất cả thông báo của người dùng
   */
  async getNotificationsByUser(
    userId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<NotificationPaginationResult> {
    const pageNum = Math.max(1, Math.floor(page))
    const limitNum = Math.min(Math.max(1, Math.floor(limit)), 100)
    const skip = (pageNum - 1) * limitNum

    // BaseRepository.findAndCount returns { data, total }
    const result = await this.notificationRepository.findAndCount({
      where: { userId },
      order: { created_at: 'DESC' },
      skip,
      take: limitNum
    })

    const notifications = result.data
    const total = result.total

    // Đếm số thông báo chưa đọc by fetching only ids to keep it light
    const unreadList = await this.notificationRepository.findAll({
      where: { userId, isRead: false },
      select: ['id']
    } as FindManyOptions<Notification>)
    const unreadCount = unreadList.length

    return {
      data: notifications,
      total,
      totalPages: Math.ceil(total / limitNum),
      unreadCount,
      page: pageNum,
      limit: limitNum
    }
  }
  /**
   * Đánh dấu 1 thông báo là đã đọc
   */
  async markAsRead(userId: number, notificationId: number): Promise<Notification> {
    const notification = await this.notificationRepository.findById(notificationId)
    if (!notification || notification.userId !== userId) {
      throw new ApiError(404, ErrorMessages.NOTIFICATION_NOT_FOUND)
    }

    const updated = await this.notificationRepository.updateEntity(notificationId, { isRead: true })
    if (!updated) throw new ApiError(500, ErrorMessages.UPDATE_USER_FAILED)
    return updated
  }

  /**
   * Đánh dấu tất cả thông báo của người dùng là đã đọc
   */
  async markAllAsRead(userId: number): Promise<number> {
    return this.notificationRepository.markAllAsRead(userId)
  }

  /**
   * Xóa 1 thông báo
   */
  async deleteNotification(userId: number, notificationId: number): Promise<void> {
    const notification = await this.notificationRepository.findById(notificationId)
    if (!notification || notification.userId !== userId) {
      throw new ApiError(404, ErrorMessages.NOTIFICATION_NOT_FOUND)
    }

    const deleted = await this.notificationRepository.deleteEntity(notificationId)
    if (!deleted) throw new ApiError(500, ErrorMessages.SLOT_NOT_FOUND)
  }
}
