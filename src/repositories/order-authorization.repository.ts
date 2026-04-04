import { injectable } from 'inversify'

import { OrderAuthorization } from '@/entities/order-authorization.model'

import { BaseRepository } from './base.repository'
import { IOrderAuthorizationRepository } from './order-authorization.interface'

@injectable()
export class OrderAuthorizationRepository
  extends BaseRepository<OrderAuthorization>
  implements IOrderAuthorizationRepository
{
  constructor() {
    super(OrderAuthorization)
  }
}
