import { Router } from 'express'

import { BuildingController } from '@/controllers/building.controller'
import { container } from '@/di/container'
import TYPES from '@/di/types'

const buildingRouter = Router()

const buildingController = container.get<BuildingController>(TYPES.BuildingController)

buildingRouter.get('/', buildingController.getAccessibleBuildings)

export default buildingRouter
