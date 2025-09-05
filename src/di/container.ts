import { Container } from 'inversify'

import { AuthController } from '@/controllers/auth.controller'
import { UserController } from '@/controllers/user.controller'
import { BuildingRepository } from '@/repositories/building.repository'
import { AuthService } from '@/services/auth.service'
import { UserService } from '@/services/user.service'

import TYPES from './types'
import { UserRepository } from '../repositories/user.repository'

const container = new Container()

// Bind User-related dependencies
container.bind(TYPES.UserRepository).to(UserRepository)
container.bind(TYPES.UserService).to(UserService)
container.bind(TYPES.UserController).to(UserController)

// Bind auth dependencies
container.bind<AuthService>(TYPES.AuthService).to(AuthService)
container.bind<AuthController>(TYPES.AuthController).to(AuthController)

// Bind building dependencies
container.bind<BuildingRepository>(TYPES.BuildingRepository).to(BuildingRepository)

export { container }
