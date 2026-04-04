import autoBind from 'auto-bind'
import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'

import { SuccessMessages } from '@/common/constants/messages'
import { ApiSuccess } from '@/common/responses'
import TYPES from '@/di/types'
import { ChatService } from '@/services/chat.service'

@injectable()
export class ChatController {
  constructor(@inject(TYPES.ChatService) private readonly chatService: ChatService) {
    autoBind(this)
  }

  async ask(req: Request, res: Response, next: NextFunction) {
    try {
      const { message } = req.body as { message: string }
      const reply = await this.chatService.generateReply(message)

      return ApiSuccess.ok({ reply }, SuccessMessages.CHATBOT_REPLY).send(res)
    } catch (error) {
      next(error)
    }
  }
}
