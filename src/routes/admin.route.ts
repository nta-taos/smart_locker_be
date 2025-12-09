import { Router } from 'express'

import { adminMiddleware } from '@/common/middleware/admin.middleware'
import { authMiddleware } from '@/common/middleware/auth.middleware'
import { validationMiddleware } from '@/common/middleware/validation.middleware'
import type { AdminController } from '@/controllers/admin.controller'
import { container } from '@/di/container'
import TYPES from '@/di/types'
import {
  CreateBuildingDto,
  UpdateBuildingDto,
  CreateLockerDto,
  UpdateLockerDto,
  CreateSlotDto,
  UpdateSlotDto,
  OpenLockerRemoteDto
} from '@/dtos/admin.dto'

const router = Router()
const adminController = container.get<AdminController>(TYPES.AdminController)

// All routes require authentication and admin role
router.use(authMiddleware, adminMiddleware)

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats)

// Remote Locker Control
router.post('/slots/:slotId/open', validationMiddleware(OpenLockerRemoteDto), adminController.openLockerRemote)

// Buildings
router.get('/buildings', adminController.getAllBuildings)
router.get('/buildings/:id', adminController.getBuildingById)
router.post('/buildings', validationMiddleware(CreateBuildingDto), adminController.createBuilding)
router.put('/buildings/:id', validationMiddleware(UpdateBuildingDto), adminController.updateBuilding)
router.delete('/buildings/:id', adminController.deleteBuilding)

// Lockers
router.get('/lockers', adminController.getAllLockers)
router.get('/lockers/:id', adminController.getLockerById)
router.post('/lockers', validationMiddleware(CreateLockerDto), adminController.createLocker)
router.put('/lockers/:id', validationMiddleware(UpdateLockerDto), adminController.updateLocker)
router.delete('/lockers/:id', adminController.deleteLocker)

// Slots
router.get('/slots', adminController.getAllSlots)
router.get('/slots/:id', adminController.getSlotById)
router.post('/slots', validationMiddleware(CreateSlotDto), adminController.createSlot)
router.put('/slots/:id', validationMiddleware(UpdateSlotDto), adminController.updateSlot)
router.delete('/slots/:id', adminController.deleteSlot)

export default router
