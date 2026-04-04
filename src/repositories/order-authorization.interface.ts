import { OrderAuthorization } from '@/entities/order-authorization.model'

import { IBaseRepository } from './base.repository.interface'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IOrderAuthorizationRepository extends IBaseRepository<OrderAuthorization> {}
