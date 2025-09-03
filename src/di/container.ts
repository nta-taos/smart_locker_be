import { Container } from 'inversify'

import { UserController } from '@/controllers/user.controller'
import { UserService } from '@/services/user.service'

import TYPES from './types'
import { UserRepository } from '../repositories/user.repository'

const container = new Container()

// Bind User-related dependencies
container.bind(TYPES.UserRepository).to(UserRepository)
container.bind(TYPES.UserService).to(UserService)
container.bind(TYPES.UserController).to(UserController)

export { container }
