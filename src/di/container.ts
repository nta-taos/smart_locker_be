import { Container } from 'inversify'

import { MQTT_CONFIG } from '@/config/config'
import { AuthController } from '@/controllers/auth.controller'
import { BuildingController } from '@/controllers/building.controller'
import { ChatController } from '@/controllers/chat.controller'
import { NotificationController } from '@/controllers/notification.controller'
import { OrderAuthorizationController } from '@/controllers/order-authorization.controller'
import { OrderController } from '@/controllers/order.controller'
import { PayosController } from '@/controllers/payos.controller'
import { UserController } from '@/controllers/user.controller'
import { WalletTransactionController } from '@/controllers/wallet-transaction.controller'
import { BuildingRepository } from '@/repositories/building.repository'
import { LockerSlotRepository } from '@/repositories/locker-slot.repository'
import { NotificationRepository } from '@/repositories/notification.repository'
import { OrderAuthorizationRepository } from '@/repositories/order-authorization.repository'
import { OrderRepository } from '@/repositories/order.repository'
import { UserRepository } from '@/repositories/user.repository'
import { WalletTransactionRepository } from '@/repositories/wallet-transaction.repository'
import { AuthService } from '@/services/auth.service'
import { BuildingService } from '@/services/building.service'
import { ChatService } from '@/services/chat.service'
import { ImageUploadService } from '@/services/image-upload.service'
import { MailService } from '@/services/mail.service'
import { MQTTService } from '@/services/mqtt.service'
import { NotificationService } from '@/services/notification.service'
import { OrderAuthorizationService } from '@/services/order-authorization.service'
import { OrderService } from '@/services/order.service'
import { PayosService } from '@/services/payos.service'
import { RedisService } from '@/services/redis.service'
import SocketService from '@/services/socket.service'
import { UserService } from '@/services/user.service'
import { WalletTransactionService } from '@/services/wallet-transaction.service'

import TYPES from './types'

const container = new Container()

// Bind User-related dependencies
container.bind<UserRepository>(TYPES.UserRepository).to(UserRepository)
container.bind<UserService>(TYPES.UserService).to(UserService)
container.bind<UserController>(TYPES.UserController).to(UserController)

// Bind auth dependencies
container.bind<AuthService>(TYPES.AuthService).to(AuthService)
container.bind<AuthController>(TYPES.AuthController).to(AuthController)

// Bind building dependencies
container.bind<BuildingRepository>(TYPES.BuildingRepository).to(BuildingRepository)
container.bind<BuildingService>(TYPES.BuildingService).to(BuildingService)
container.bind<BuildingController>(TYPES.BuildingController).to(BuildingController)

// Bind wallet transaction dependencies
container.bind<WalletTransactionRepository>(TYPES.WalletTransactionRepository).to(WalletTransactionRepository)
container.bind<WalletTransactionService>(TYPES.WalletTransactionService).to(WalletTransactionService)
container.bind<WalletTransactionController>(TYPES.WalletTransactionController).to(WalletTransactionController)

// Bind order dependencies
container.bind<OrderRepository>(TYPES.OrderRepository).to(OrderRepository)
container.bind<OrderService>(TYPES.OrderService).to(OrderService)
container.bind<OrderController>(TYPES.OrderController).to(OrderController)

// Bind uploand image
container.bind<ImageUploadService>(TYPES.ImageUploadService).to(ImageUploadService)

// Bind locker slot dependencies
container.bind<LockerSlotRepository>(TYPES.LockerSlotRepository).to(LockerSlotRepository)

// Bind SocketService
container.bind<SocketService>(TYPES.SocketService).to(SocketService).inSingletonScope()

// bind config
container.bind<typeof MQTT_CONFIG>(TYPES.MQTTConfig).toConstantValue(MQTT_CONFIG)

// bind service
container.bind<MQTTService>(TYPES.MQTTService).to(MQTTService).inSingletonScope()

// bind redis
container.bind<RedisService>(TYPES.RedisService).to(RedisService).inSingletonScope()

// bind Notification
container.bind<NotificationRepository>(TYPES.NotificationRepository).to(NotificationRepository)
container.bind<NotificationController>(TYPES.NotificationController).to(NotificationController)
container.bind<NotificationService>(TYPES.NotificationService).to(NotificationService)

// bind order authorization
container.bind<OrderAuthorizationRepository>(TYPES.OrderAuthorizationRepository).to(OrderAuthorizationRepository)
container.bind<OrderAuthorizationService>(TYPES.OrderAuthorizationService).to(OrderAuthorizationService)
container.bind<OrderAuthorizationController>(TYPES.OrderAuthorizationController).to(OrderAuthorizationController)

// PayOS
container.bind<PayosService>(TYPES.PayosService).to(PayosService)
container.bind<PayosController>(TYPES.PayosController).to(PayosController)

// MAIL
container.bind<MailService>(TYPES.MailService).to(MailService)

// Chatbot
container.bind<ChatService>(TYPES.ChatService).to(ChatService)
container.bind<ChatController>(TYPES.ChatController).to(ChatController)

export { container }
