import { Container } from 'inversify'

import { AuthController } from '@/controllers/auth.controller'
import { BuildingController } from '@/controllers/building.controller'
import { OrderController } from '@/controllers/order.controller'
import { UserController } from '@/controllers/user.controller'
import { WalletTransactionController } from '@/controllers/wallet-transaction.controller'
import { BuildingRepository } from '@/repositories/building.repository'
import { LockerSlotRepository } from '@/repositories/locker-slot.repository'
import { OrderRepository } from '@/repositories/order.repository'
import { WalletTransactionRepository } from '@/repositories/wallet-transaction.repository'
import { AuthService } from '@/services/auth.service'
import { BuildingService } from '@/services/building.service'
import { ImageUploadService } from '@/services/image-upload.service'
import { OrderService } from '@/services/order.service'
import { UserService } from '@/services/user.service'
import { WalletTransactionService } from '@/services/wallet-transaction.service'

import TYPES from './types'
import { UserRepository } from '../repositories/user.repository'

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

export { container }
