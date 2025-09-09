import mqtt, { MqttClient } from 'mqtt'

import { MQTT_CONFIG } from '@/config/config'

class MQTTService {
  private static instance: MQTTService
  private client: MqttClient
  private reconnectAttempts = 0
  private maxReconnect = 5
  private constructor() {
    this.client = mqtt.connect(MQTT_CONFIG.brokerUrl, {
      username: MQTT_CONFIG.username,
      password: MQTT_CONFIG.password,
      reconnectPeriod: 2000
    })

    this.client.on('connect', () => {
      console.log('✅ MQTT connected')
      this.publish('devices/test/data', { message: 'Hello from backend!' })
      this.reconnectAttempts = 0
      this.subscribeToTopics()
    })
    this.client.on('error', (err: Error) => console.error('MQTT error', err))
    this.client.on('close', () => console.log('MQTT connection closed'))
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

  public static getInstance(): MQTTService {
    if (!MQTTService.instance) {
      MQTTService.instance = new MQTTService()
    }
    return MQTTService.instance
  }

  private subscribeToTopics() {
    this.client.subscribe('devices/+/data', (err) => {
      if (err) console.error('❌ MQTT subscribe failed', err)
      else console.log('Subscribed to topic: devices/+/data')
    })
  }

  private handleMessage(topic: string, message: Buffer) {
    const deviceId = topic.split('/')[1]
    try {
      const payload = JSON.parse(message.toString())
      console.log(`Received data from device ${deviceId}:`, payload)
    } catch {
      console.error('Invalid JSON message:', message.toString())
    }
  }

  public publish(topic: string, message: unknown) {
    if (this.client && this.client.connected) {
      const payload = typeof message === 'string' ? message : JSON.stringify(message)
      this.client.publish(topic, payload)
    }
  }

  public getClient(): MqttClient {
    return this.client
  }
}

export const mqttService = MQTTService.getInstance()
