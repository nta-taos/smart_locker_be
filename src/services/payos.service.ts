import autoBind from 'auto-bind'
import axios from 'axios'
import crypto from 'crypto'
import https from 'https'
import { injectable, inject } from 'inversify'

import { TransactionType } from '@/common/enum/transaction.enum'
import { ApiError } from '@/common/responses'
import { PAYOS_CONFIG } from '@/config/config'
import { AppDataSource } from '@/config/mysql'
import TYPES from '@/di/types'
import { User } from '@/entities/user.model'
import { WalletTransaction } from '@/entities/wallet-transaction.model'
import { UserRepository } from '@/repositories/user.repository'

import { RedisService } from './redis.service'
import SocketService from './socket.service'

@injectable()
export class PayosService {
  private gatewayBase = 'https://api-merchant.payos.vn/v2/payment-requests'

  constructor(
    @inject(TYPES.RedisService) private readonly redisService: RedisService,
    @inject(TYPES.UserRepository) private readonly userRepo: UserRepository,
    @inject(TYPES.SocketService) private readonly socketService: SocketService
  ) {
    autoBind(this)
  }

  async createPayment(userId: number, amount: number, orderId?: number) {
    const orderCode = Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`)
    console.log('Creating payment with orderCode:', orderCode)
    const rawDescription = `Nạp tiền vào ví`

    const description = rawDescription.length > 25 ? rawDescription.slice(0, 25) : rawDescription

    const signData = {
      amount,
      cancelUrl: PAYOS_CONFIG.cancelUrl,
      description,
      orderCode,
      returnUrl: PAYOS_CONFIG.returnUrl
    }

    const signature = this.createSignature(signData, PAYOS_CONFIG.checksumKey)

    const body = {
      ...signData,
      signature,
      cancelUrl: PAYOS_CONFIG.cancelUrl,
      returnUrl: PAYOS_CONFIG.returnUrl
    }

    const headers = {
      'x-client-id': PAYOS_CONFIG.clientId,
      'x-api-key': PAYOS_CONFIG.apiKey,
      'Content-Type': 'application/json'
    }

    // Gửi request tới PayOS
    let response
    try {
      response = await axios.post(this.gatewayBase, body, {
        headers,
        httpsAgent: new https.Agent({
          rejectUnauthorized: false
        })
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      const respObj = err as { response?: { data?: unknown } } | undefined
      const respData = respObj?.response?.data ?? null
      throw new Error(`PayOS request failed: ${msg} - ${JSON.stringify(respData)}`)
    }

    const paymentUrl = response.data?.data?.checkoutUrl
    if (!paymentUrl) throw new Error(`Không thể tạo link thanh toán từ PayOS: ${JSON.stringify(response.data)}`)

    await this.redisService.safeSetCache(
      `payos:payment:${orderCode}`,
      {
        userId,
        amount,
        orderId
      },
      60 * 60
    )

    return { paymentUrl, orderCode }
  }

  private createSignature(data: Record<string, string | number>, checksumKey: string): string {
    // Sắp xếp các key
    const sortedKeys = Object.keys(data).sort()

    // Chỉ lấy các trường có giá trị (không phải null/undefined)
    const sortedData = sortedKeys.reduce((acc: Record<string, string | number>, key) => {
      const value = data[key] // Lấy giá trị
      // PayOS chỉ ký các trường có giá trị
      if (value !== null && value !== undefined && value !== '') {
        acc[key] = value
      }
      return acc
    }, {})

    // Tạo chuỗi để ký
    const stringToSign = Object.entries(sortedData)
      .map(([key, value]) => `${key}=${value}`)
      .join('&')

    // Thêm log RẤT QUAN TRỌNG này để debug
    console.log('stringToSign (Webhook):', stringToSign)

    return crypto.createHmac('sha256', checksumKey).update(stringToSign).digest('hex')
  }

  /**
   * Verify webhook signature from PayOS
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  verifyChecksum(dataObject: Record<string, any>, signature: string): boolean {
    const expectedSignature = this.createSignature(dataObject, PAYOS_CONFIG.checksumKey)
    return signature === expectedSignature
  }

  /**
   * Khi PayOS gửi webhook báo thanh toán thành công → cộng tiền vào ví
   */
  async confirmPayment(orderCode: number) {
    const data = await this.redisService.getCache<{
      userId: number
      amount: number
      orderId?: number
    }>(`payos:payment:${orderCode}`)

    if (!data) return null

    return await AppDataSource.transaction(async (manager) => {
      const user = await manager.findOne(User, {
        where: { id: data.userId },
        relations: ['wallet'],
        lock: { mode: 'pessimistic_write' }
      })

      if (!user || !user.wallet) {
        throw ApiError.internal('Không tìm thấy thông tin ví của người dùng.')
      }

      user.wallet.balance = Number(user.wallet.balance) + Number(data.amount)
      await manager.save(user.wallet)

      const walletTransaction = manager.create(WalletTransaction, {
        type: TransactionType.CREDIT,
        wallet: user.wallet,
        amount: data.amount,
        description: `Nạp tiền ví PayOS: ${orderCode}`
      })
      await manager.save(walletTransaction)

      this.socketService.emitToUser(user.id, 'wallet:updated', user.wallet)
      this.socketService.emitToUser(user.id, 'transaction:created', walletTransaction)

      await this.redisService.delCache(`payos:payment:${orderCode}`)
      await this.redisService.delCache(`user:${user.id}`)

      return {
        userId: data.userId,
        amount: data.amount,
        orderId: data.orderId,
        transactionId: walletTransaction.id
      }
    })
  }
}

export default PayosService
