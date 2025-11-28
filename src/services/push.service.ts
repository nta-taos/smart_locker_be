import autoBind from 'auto-bind'
import { injectable, inject } from 'inversify'
import webpush from 'web-push'

import { VAPID_CONFIG } from '@/config/config'
import TYPES from '@/di/types'
import { PushSubscription } from '@/entities/push-subscription.model'
import { PushSubscriptionRepository } from '@/repositories/push-subscription.repository'

@injectable()
export class PushService {
  constructor(@inject(TYPES.PushSubscriptionRepository) private readonly pushRepo: PushSubscriptionRepository) {
    autoBind(this)

    // Configure web-push
    try {
      if (VAPID_CONFIG.publicKey && VAPID_CONFIG.privateKey) {
        webpush.setVapidDetails(VAPID_CONFIG.subject, VAPID_CONFIG.publicKey, VAPID_CONFIG.privateKey)
      }
    } catch (err) {
      // log but don't crash
      console.warn('web-push setup failed', err)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async saveSubscription(subscription: any, userId?: number) {
    if (!subscription || !subscription.endpoint) throw new Error('Invalid subscription')

    console.log(
      '[PushService] Saving subscription for userId:',
      userId,
      'endpoint:',
      subscription.endpoint?.substring(0, 50) + '...'
    )
    const existing = await this.pushRepo.findByEndpoint(subscription.endpoint)
    if (existing) {
      console.log('[PushService] Subscription exists, updating with userId:', userId)
      return this.pushRepo.updateEntity(existing.id, { keys: subscription.keys, userId })
    }

    const entity = new PushSubscription()
    entity.endpoint = subscription.endpoint
    entity.keys = subscription.keys
    if (userId) entity.userId = userId
    const saved = await this.pushRepo.createEntity(entity)
    console.log('[PushService] New subscription saved, id:', saved.id)
    return saved
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async sendToSubscription(subscription: any, payload: object) {
    try {
      console.log(
        '[PushService] Sending push to endpoint:',
        subscription.endpoint?.substring(0, 50) + '...',
        'payload:',
        JSON.stringify(payload).substring(0, 100)
      )
      const result = await webpush.sendNotification(subscription, JSON.stringify(payload))
      console.log('[PushService] Push sent successfully:', result)
      return true
    } catch (err) {
      console.error('[PushService] Failed to send push:', err)
      return false
    }
  }

  async sendToUser(userId: number, payload: object) {
    console.log('[PushService] Sending to userId:', userId)
    const list = await this.pushRepo.findAll({ where: { userId } })
    console.log('[PushService] Found', list.length, 'subscriptions for userId:', userId)
    if (list.length === 0) {
      console.warn('[PushService] No subscriptions found for userId:', userId)
      return []
    }
    const promises = list.map((s) => {
      console.log('[PushService] Queuing push for subscription id:', s.id)
      return this.sendToSubscription({ endpoint: s.endpoint, keys: s.keys }, payload)
    })
    return Promise.all(promises)
  }
}
