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

  async createPayment(userId: number, amount: number, orderId?: number) {
    const orderCode = Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`)
    console.log('Creating payment with orderCode:', orderCode)
    const rawDescription = `Nạp ${amount.toLocaleString()}đ vào ví người dùng #${userId}`

    const description = rawDescription.length > 25 ? rawDescription.slice(0, 25) : rawDescription

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
  verifyChecksum(dataObject: Record<string, any>, signature: string): boolean {
    // Không tạo object mới, mà dùng chính object 'data' từ webhook
    const expectedSignature = this.createSignature(dataObject, this.checksumKey)

    console.log('Received Signature:', signature)
    console.log('Expected Signature:', expectedSignature)

    return signature === expectedSignature
  }

  /**
   * Khi PayOS gửi webhook báo thanh toán thành công → cộng tiền vào ví
   */
  async confirmPayment(orderCode: number) {
    console.log('Confirming payment for orderCode:', orderCode)
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
