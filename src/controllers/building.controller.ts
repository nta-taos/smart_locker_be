import autoBind from 'auto-bind'
import { NextFunction, Request, Response } from 'express'
import { injectable, inject } from 'inversify'

import { SuccessMessages } from '@/common/constants/messages'
import { ApiSuccess } from '@/common/responses'
import { getUserIdFromHeader } from '@/common/utils/helpers'
import TYPES from '@/di/types'
import { BuildingService } from '@/services/building.service'

@injectable()
export class BuildingController {
  constructor(@inject(TYPES.BuildingService) private readonly buildingService: BuildingService) {
    autoBind(this)
  }

  async getAccessibleBuildings(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = getUserIdFromHeader(req)
      const buildings = await this.buildingService.getAccessibleBuildings(userId)
      return ApiSuccess.ok(buildings, SuccessMessages.BUILDING_PUBLIC_RETRIEVED).send(res)
    } catch (err) {
      next(err)
    }
  }
}
