import { Notification } from '@/entities/notification.model'

import { IBaseRepository } from './base.repository.interface'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface INotificationRepository extends IBaseRepository<Notification> {}
