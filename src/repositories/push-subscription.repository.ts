import { injectable } from 'inversify'

import { PushSubscription } from '@/entities/push-subscription.model'
import { BaseRepository } from './base.repository'

@injectable()
export class PushSubscriptionRepository extends BaseRepository<PushSubscription> {
  constructor() {
    super(PushSubscription)
  }

  async findByEndpoint(endpoint: string) {
    return this.repository.findOne({ where: { endpoint } })
  }
}
