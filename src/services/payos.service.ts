import autoBind from 'auto-bind'
import axios from 'axios'
import crypto from 'crypto'
import https from 'https'
import { injectable, inject } from 'inversify'

import { AppDataSource } from '@/config/mysql'
import TYPES from '@/di/types'
import { Wallet } from '@/entities/wallet.model'
import { UserRepository } from '@/repositories/user.repository'

import { RedisService } from './redis.service'

@injectable()
export class PayosService {
  private clientId = process.env.PAYOS_CLIENT_ID || ''
  private apiKey = process.env.PAYOS_API_KEY || ''
  private checksumKey = process.env.PAYOS_CHECKSUM_KEY || ''
  private returnUrl = process.env.PAYOS_RETURN_URL || ''
  private cancelUrl = process.env.PAYOS_CANCEL_URL || ''
  private gatewayBase = 'https://api-merchant.payos.vn/v2/payment-requests'

  constructor(
    @inject(TYPES.RedisService) private readonly redisService: RedisService,
    @inject(TYPES.UserRepository) private readonly userRepo: UserRepository
  ) {
    autoBind(this)
  }

  /**
   * Tạo yêu cầu thanh toán thật trên PayOS (production)
   */
  async createPayment(userId: number, amount: number, orderId?: number) {
    const orderCode = Date.now()
    const rawDescription = `Nạp ${amount.toLocaleString()}đ vào ví người dùng #${userId}`

    // PayOS limits description length to 25 chars and does not accept a currency field in this endpoint
    const description = rawDescription.length > 25 ? rawDescription.slice(0, 25) : rawDescription

    // Create signature following PayOS format
    const signData = {
      amount,
      cancelUrl: this.cancelUrl,
      description,
      orderCode,
      returnUrl: this.returnUrl
    }

    const signature = this.createSignature(signData, this.checksumKey)

    const body = {
      ...signData,
      signature,
      cancelUrl: this.cancelUrl,
      returnUrl: this.returnUrl
    }

    const headers = {
      'x-client-id': this.clientId,
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json'
    }

    // Gửi request tới PayOS
    let response
    try {
      response = await axios.post(this.gatewayBase, body, {
        headers,
        httpsAgent: new https.Agent({
          // Nếu bạn gặp vấn đề với chứng chỉ trong dev, đặt false (chỉ dev)
          rejectUnauthorized: false
        })
      })
    } catch (err: unknown) {
      // Bao gồm response body nếu có để debug
      // err may be an AxiosError with response, so try to safely extract
      const msg = err instanceof Error ? err.message : String(err)
      // try to access response data if available
      const respObj = err as { response?: { data?: unknown } } | undefined
      const respData = respObj?.response?.data ?? null
      // Ghi log cho backend
      console.error('PayOS POST error:', msg, respData)
      throw new Error(`PayOS request failed: ${msg} - ${JSON.stringify(respData)}`)
    }

    const paymentUrl = response.data?.data?.checkoutUrl
    if (!paymentUrl) throw new Error(`Không thể tạo link thanh toán từ PayOS: ${JSON.stringify(response.data)}`)

    // Lưu metadata vào Redis để xác nhận sau khi webhook tới
    await this.redisService.safeSetCache(
      `payos:payment:${orderCode}`,
      {
        userId,
        amount,
        orderId
      },
      60 * 60 // 1 giờ
    )

    return { paymentUrl, orderCode }
  }

  /**
   * Xác minh checksum trả về từ webhook PayOS
   */
  /**
   * Create HMAC-SHA256 signature for PayOS
   */
  private createSignature(data: Record<string, string | number>, checksumKey: string): string {
    // Sort by field name
    const sortedKeys = Object.keys(data).sort()
    const sortedData = sortedKeys.reduce((acc: Record<string, string | number>, key) => {
      if (data[key] !== null && data[key] !== undefined) {
        acc[key] = data[key]
      }
      return acc
    }, {})

    // Create string to sign
    const stringToSign = Object.entries(sortedData)
      .map(([key, value]) => `${key}=${value}`)
      .join('&')

    // Create HMAC-SHA256
    return crypto.createHmac('sha256', checksumKey).update(stringToSign).digest('hex')
  }

  /**
   * Verify webhook signature from PayOS
   */
  verifyChecksum(orderCode: number, amount: number, description: string, checksum: string) {
    const signData = {
      amount,
      description,
      orderCode
    }

    const expected = this.createSignature(signData, this.checksumKey)
    return checksum === expected
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

    const user = await this.userRepo.findById(data.userId)
    if (!user || !user.wallet) return null

    const walletRepo = AppDataSource.getRepository(Wallet)
    const wallet = await walletRepo.findOne({ where: { id: user.wallet.id } })
    if (!wallet) return null

    wallet.balance = Number(wallet.balance) + Number(data.amount)
    await walletRepo.save(wallet)

    await this.redisService.delCache(`payos:payment:${orderCode}`)

    return { userId: data.userId, amount: data.amount, orderId: data.orderId }
  }
}

export default PayosService
