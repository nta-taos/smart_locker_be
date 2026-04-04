import { Router } from 'express'

import { BuildingController } from '@/controllers/building.controller'
import { container } from '@/di/container'
import TYPES from '@/di/types'

export default function createBuildingRouter(): Router {
  const router = Router()
  const buildingController = container.get<BuildingController>(TYPES.BuildingController)

  router.get('/', buildingController.getAllBuildings)

  return router
}
