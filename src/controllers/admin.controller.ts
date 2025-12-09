import autoBind from 'auto-bind'
import { NextFunction, Request, Response } from 'express'
import { injectable, inject } from 'inversify'

import { SuccessMessages } from '@/common/constants/messages'
import { ApiSuccess } from '@/common/responses'
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
import { User } from '@/entities/user.model'
import { AdminService } from '@/services/admin.service'
import { BuildingService } from '@/services/building.service'
import { LockerSlotService } from '@/services/locker-slot.service'
import { LockerService } from '@/services/locker.service'

@injectable()
export class AdminController {
  constructor(
    @inject(TYPES.AdminService) private readonly adminService: AdminService,
    @inject(TYPES.BuildingService) private readonly buildingService: BuildingService,
    @inject(TYPES.LockerService) private readonly lockerService: LockerService,
    @inject(TYPES.LockerSlotService) private readonly slotService: LockerSlotService
  ) {
    autoBind(this)
  }

  // Dashboard Statistics
  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User
      const date = req.query.date as string | undefined

      const stats = await this.adminService.getDashboardStats(user.id, user.role, date)
      return ApiSuccess.ok(stats, 'Thống kê dashboard được truy xuất thành công.').send(res)
    } catch (err) {
      next(err)
    }
  }

  // Remote Locker Opening
  async openLockerRemote(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as User
      const slotId = parseInt(req.params.slotId)
      const { reason } = req.body as Partial<OpenLockerRemoteDto>

      const result = await this.adminService.openLockerRemote(user.id, user.role, slotId, reason)
      return ApiSuccess.ok(result, 'Mở ngăn tủ từ xa thành công.').send(res)
    } catch (err) {
      next(err)
    }
  }

  // Building Management
  async getAllBuildings(req: Request, res: Response, next: NextFunction) {
    try {
      const buildings = await this.buildingService.getAllBuildings()
      return ApiSuccess.ok(buildings, SuccessMessages.BUILDING_PUBLIC_RETRIEVED).send(res)
    } catch (err) {
      next(err)
    }
  }

  async getBuildingById(req: Request, res: Response, next: NextFunction) {
    try {
      const buildingId = parseInt(req.params.id)
      const building = await this.buildingService.getBuildingById(buildingId)
      return ApiSuccess.ok(building, 'Lấy thông tin tòa nhà thành công.').send(res)
    } catch (err) {
      next(err)
    }
  }

  async createBuilding(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreateBuildingDto
      const building = await this.buildingService.createBuilding(data)
      return ApiSuccess.created(building, 'Tạo tòa nhà thành công.').send(res)
    } catch (err) {
      next(err)
    }
  }

  async updateBuilding(req: Request, res: Response, next: NextFunction) {
    try {
      const buildingId = parseInt(req.params.id)
      const data = req.body as UpdateBuildingDto
      const building = await this.buildingService.updateBuilding(buildingId, data)
      return ApiSuccess.ok(building, 'Cập nhật tòa nhà thành công.').send(res)
    } catch (err) {
      next(err)
    }
  }

  async deleteBuilding(req: Request, res: Response, next: NextFunction) {
    try {
      const buildingId = parseInt(req.params.id)
      await this.buildingService.deleteBuilding(buildingId)
      return ApiSuccess.ok(null, 'Xóa tòa nhà thành công.').send(res)
    } catch (err) {
      next(err)
    }
  }

  // Locker Management
  async getAllLockers(req: Request, res: Response, next: NextFunction) {
    try {
      const buildingId = req.query.buildingId ? parseInt(req.query.buildingId as string) : undefined

      const lockers = buildingId
        ? await this.lockerService.getLockersByBuilding(buildingId)
        : await this.lockerService.getAllLockers()

      return ApiSuccess.ok(lockers, 'Lấy danh sách tủ thành công.').send(res)
    } catch (err) {
      next(err)
    }
  }

  async getLockerById(req: Request, res: Response, next: NextFunction) {
    try {
      const lockerId = parseInt(req.params.id)
      const locker = await this.lockerService.getLockerById(lockerId)
      return ApiSuccess.ok(locker, 'Lấy thông tin tủ thành công.').send(res)
    } catch (err) {
      next(err)
    }
  }

  async createLocker(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreateLockerDto
      const locker = await this.lockerService.createLocker(data)
      return ApiSuccess.created(locker, 'Tạo tủ thành công.').send(res)
    } catch (err) {
      next(err)
    }
  }

  async updateLocker(req: Request, res: Response, next: NextFunction) {
    try {
      const lockerId = parseInt(req.params.id)
      const data = req.body as UpdateLockerDto
      const locker = await this.lockerService.updateLocker(lockerId, data)
      return ApiSuccess.ok(locker, 'Cập nhật tủ thành công.').send(res)
    } catch (err) {
      next(err)
    }
  }

  async deleteLocker(req: Request, res: Response, next: NextFunction) {
    try {
      const lockerId = parseInt(req.params.id)
      await this.lockerService.deleteLocker(lockerId)
      return ApiSuccess.ok(null, 'Xóa tủ thành công.').send(res)
    } catch (err) {
      next(err)
    }
  }

  // Slot Management
  async getAllSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const lockerId = req.query.lockerId ? parseInt(req.query.lockerId as string) : undefined

      const slots = lockerId ? await this.slotService.getSlotsByLocker(lockerId) : await this.slotService.getAllSlots()

      return ApiSuccess.ok(slots, 'Lấy danh sách ngăn tủ thành công.').send(res)
    } catch (err) {
      next(err)
    }
  }

  async getSlotById(req: Request, res: Response, next: NextFunction) {
    try {
      const slotId = parseInt(req.params.id)
      const slot = await this.slotService.getSlotById(slotId)
      return ApiSuccess.ok(slot, 'Lấy thông tin ngăn tủ thành công.').send(res)
    } catch (err) {
      next(err)
    }
  }

  async createSlot(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body as CreateSlotDto
      const slot = await this.slotService.createSlot(data)
      return ApiSuccess.created(slot, 'Tạo ngăn tủ thành công.').send(res)
    } catch (err) {
      next(err)
    }
  }

  async updateSlot(req: Request, res: Response, next: NextFunction) {
    try {
      const slotId = parseInt(req.params.id)
      const data = req.body as UpdateSlotDto
      const slot = await this.slotService.updateSlot(slotId, data)
      return ApiSuccess.ok(slot, 'Cập nhật ngăn tủ thành công.').send(res)
    } catch (err) {
      next(err)
    }
  }

  async deleteSlot(req: Request, res: Response, next: NextFunction) {
    try {
      const slotId = parseInt(req.params.id)
      await this.slotService.deleteSlot(slotId)
      return ApiSuccess.ok(null, 'Xóa ngăn tủ thành công.').send(res)
    } catch (err) {
      next(err)
    }
  }
}
