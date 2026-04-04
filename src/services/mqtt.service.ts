import { injectable, inject } from 'inversify'
import mqtt, { MqttClient } from 'mqtt'
import { v4 as uuidv4 } from 'uuid'

import { MQTT_CONFIG } from '@/config/config'
import TYPES from '@/di/types'

export type LockerState = 'OPENED' | 'CLOSED' | 'FAILED' | 'JAMMED'

export interface LockerResponse {
  requestId: string
  slot_id: number
  hw_index: number
  action: string
  state: LockerState
  timestamp: number
  error?: string
}

type PendingRequest = {
  resolve: (value: LockerResponse) => void
  reject: (reason?: Error) => void
  timeout: NodeJS.Timeout
}

@injectable()
export class MQTTService {
  private client: MqttClient
  private reconnectAttempts = 0
  private maxReconnect = 5
  private pendingRequests: Map<string, PendingRequest> = new Map()

  constructor(@inject(TYPES.MQTTConfig) private config: typeof MQTT_CONFIG) {
    this.client = mqtt.connect(this.config.brokerUrl, {
      username: this.config.username,
      password: this.config.password,
      reconnectPeriod: 2000,
      will: {
        topic: 'backend/status',
        payload: JSON.stringify({ online: false, timestamp: Date.now() }),
        qos: 1,
        retain: true
      }
    })

    this.initEvents()
  }

  private initEvents() {
    this.client.on('connect', () => {
      console.log('✅ MQTT connected')
      this.publish('backend/status', { online: true, timestamp: Date.now() })
      this.reconnectAttempts = 0

      this.client.subscribe('locker/+/status', { qos: 0 }, (err) => {
        if (err) console.error('❌ Lỗi subscribe:', err)
        else console.log('📡 Đã subscribe topic locker/+/status')
      })
    })

    this.client.on('error', (err: Error) => console.error('❌ MQTT error', err))
    this.client.on('close', () => console.log('⚠️ MQTT connection closed'))
    this.client.on('reconnect', () => {
      this.reconnectAttempts++
      console.log(`MQTT reconnecting, attempt #${this.reconnectAttempts}`)
      if (this.reconnectAttempts > this.maxReconnect) {
        console.error('❌ Max reconnect attempts reached, disconnecting...')
        this.client.end(true)
      }
    })

    this.client.on('message', (topic, message) => this.handleMessage(topic, message))
  }

  private handleMessage(topic: string, message: Buffer) {
    try {
      const payload = JSON.parse(message.toString()) as LockerResponse
      console.log(`📩 Nhận phản hồi từ topic ${topic}:`, payload)

      const { requestId, state } = payload
      if (requestId && this.pendingRequests.has(requestId)) {
        const { resolve, reject, timeout } = this.pendingRequests.get(requestId)!
        clearTimeout(timeout)

        // ✅ Sửa lại điều kiện state đúng
        if (state === 'OPENED') {
          console.log('✅ Ngăn tủ mở thành công.')
          resolve(payload)
        } else {
          console.warn('⚠️ Lệnh thất bại:', state)
          reject(new Error(`Lệnh thất bại: ${state}`))
        }

        this.pendingRequests.delete(requestId)
      }
    } catch (err) {
      console.error('❌ Invalid JSON message:', message.toString(), err)
    }
  }

  public sendCommand(
    lockerId: string | number,
    slot_id: number,
    hwIndex: number,
    action: string,
    timeoutMs = 5000
  ): Promise<LockerResponse> {
    return new Promise((resolve, reject) => {
      const requestId = uuidv4()

      const payload = {
        slot_id,
        hw_index: hwIndex,
        action,
        requestId
      }

      const topic = `locker/${lockerId}/control`
      console.log(`📤 Gửi lệnh đến topic ${topic}:`, payload)
      this.client.publish(topic, JSON.stringify(payload), { qos: 0 })

      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId)
        reject(new Error('⏰ Quá thời gian chờ phản hồi từ thiết bị'))
      }, timeoutMs)

      this.pendingRequests.set(requestId, { resolve, reject, timeout })
    })
  }

  public publish(topic: string, message: unknown) {
    if (this.client && this.client.connected) {
      const payload = typeof message === 'string' ? message : JSON.stringify(message)
      this.client.publish(topic, payload, { qos: 0, retain: false })
      console.log(`📤 Publish đến ${topic}:`, payload)
    }
  }

  public getClient(): MqttClient {
    return this.client
  }

  // 🔓 Hàm mở ngăn tủ
  public async openLocker(lockerId: number, slotId: number, hw_Index = 1): Promise<LockerResponse> {
    console.log(`🔓 Gửi lệnh mở khóa cho locker ${lockerId}, slot ${slotId}`)
    try {
      const response = await this.sendCommand(lockerId, slotId, hw_Index, 'OPEN')

      if (response.state === 'OPENED') {
        console.log(`✅ Ngăn tủ ${slotId} đã mở thành công.`)
      } else {
        console.warn(`⚠️ Ngăn tủ ${slotId} mở thất bại: ${response.state}`)
      }

      return response
    } catch (error) {
      console.error(`❌ Lỗi khi mở ngăn tủ ${slotId}:`, error)
      throw error
    }
  }
}
