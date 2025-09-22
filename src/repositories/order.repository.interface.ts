import { Order } from '@/entities/order.model'

import { IBaseRepository } from './base.repository.interface'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IOderRepository extends IBaseRepository<Order> {}
