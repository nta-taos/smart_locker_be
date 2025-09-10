import { injectable } from 'inversify'

import { Order } from '@/entities/order.model'

import { BaseRepository } from './base.repository'
import { IOderRepository } from './order.repository.interface'

@injectable()
export class OrderRepository extends BaseRepository<Order> implements IOderRepository {
  constructor() {
    super(Order)
  }
}
