import { Router } from 'express'

import { validationMiddleware } from '@/common/middleware/validation.middleware'
import { ChatController } from '@/controllers/chat.controller'
import { container } from '@/di/container'
import TYPES from '@/di/types'
import { ChatRequestDto } from '@/dtos/chat.dto'

export default function createChatRouter(): Router {
  const router = Router()
  const chatController = container.get<ChatController>(TYPES.ChatController)

  router.post('/ask', validationMiddleware(ChatRequestDto), chatController.ask)

  return router
}
