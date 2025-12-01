import autoBind from 'auto-bind'
import dayjs from 'dayjs'
import { injectable, inject } from 'inversify'
import { EntityManager, FindOptionsWhere, Like, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm'

import { ErrorMessages } from '@/common/constants/messages'
import { SlotPricePerTime, SlotSize, SlotStatus } from '@/common/enum/locker-slot.enum'
import { LockerStatus } from '@/common/enum/locker.enum'
import { NotificationType } from '@/common/enum/notification.enum'
import { OrderStatus, OrderType, PaymentStatus } from '@/common/enum/order.enum'
import { TransactionType } from '@/common/enum/transaction.enum'
import { ApiError } from '@/common/responses'
import { AppDataSource } from '@/config/mysql'
import TYPES from '@/di/types'
import { RentLockerDto, SendPackageDto, toOrderDTO } from '@/dtos/order.dto'
import { LockerSlot } from '@/entities/locker-slot.model'
import { Notification } from '@/entities/notification.model'
import { Order } from '@/entities/order.model'
import { User } from '@/entities/user.model'
import { WalletTransaction } from '@/entities/wallet-transaction.model'
import { LockerSlotRepository } from '@/repositories/locker-slot.repository'
import { NotificationRepository } from '@/repositories/notification.repository'
import { OrderRepository } from '@/repositories/order.repository'
import { UserRepository } from '@/repositories/user.repository'
import { WalletTransactionRepository } from '@/repositories/wallet-transaction.repository'

import { MQTTService } from './mqtt.service'
import SocketService from './socket.service'

@injectable()
export class OrderService {
  constructor(
    @inject(TYPES.OrderRepository) private readonly orderRepository: OrderRepository,
    @inject(TYPES.LockerSlotRepository) private readonly lockerSlotRepository: LockerSlotRepository,
    @inject(TYPES.UserRepository) private readonly userRepository: UserRepository,
    @inject(TYPES.SocketService) private readonly socketService: SocketService,
    @inject(TYPES.WalletTransactionRepository) private readonly transactionRepo: WalletTransactionRepository,
    @inject(TYPES.NotificationRepository) private readonly notificationRepository: NotificationRepository,
    @inject(TYPES.MQTTService) private readonly mqttService: MQTTService
  ) {
    autoBind(this)
  }

  private getPricePerSlotSize(slotSize: number): number {
    if (!(slotSize in SlotPricePerTime)) {
      throw ApiError.badRequest(ErrorMessages.INVALID_SLOT_SIZE)
    }

    return SlotPricePerTime[slotSize as SlotSize]
  }

  async getOrderById(orderId: number, userId: number) {
    console.log('check', orderId, userId)
    const options = {
      relations: ['sender', 'receiver', 'lockerSlot']
    }

    const order = await this.orderRepository.findOneByCondition({ id: orderId }, options)
    console.log(order)

    if (!order) {
      throw ApiError.notFound('Không tìm thấy đơn hàng.')
    }

    if (order.sender.id !== userId || order.receiver?.id !== userId) {
      throw ApiError.badRequest('Bạn không có quyền xem đơn hàng này.')
    }

    return toOrderDTO(order)
  }

  async getOrdersByUserId(
    userId: number,
    status: string = 'all',
    page: number = 1,
    limit: number = 6,
    code?: string,
    from?: string,
    to?: string
  ) {
    let whereCondition: FindOptionsWhere<Order>[] = [{ sender: { id: userId } }, { receiver: { id: userId } }]

    if (status === 'pending') {
      whereCondition = whereCondition.map((cond) => ({ ...cond, status: OrderStatus.SENDING || OrderStatus.PENDING }))
    } else if (status === 'received') {
      whereCondition = whereCondition.map((cond) => ({ ...cond, status: OrderStatus.RECEIVED }))
    }

    if (code) {
      whereCondition = whereCondition.map((cond) => ({ ...cond, order_code: Like(`%${code}%`) }))
    }

    if (from || to) {
      const fromDay = from ? dayjs(from).startOf('day').toDate() : undefined
      const toDay =
        to || from
          ? dayjs(to || from)
              .endOf('day')
              .toDate()
          : undefined

      if (fromDay && toDay) {
        whereCondition = whereCondition.map((cond) => ({ ...cond, start_time: Between(fromDay, toDay) }))
      } else if (fromDay) {
        whereCondition = whereCondition.map((cond) => ({ ...cond, start_time: MoreThanOrEqual(fromDay) }))
      } else if (toDay) {
        whereCondition = whereCondition.map((cond) => ({ ...cond, start_time: LessThanOrEqual(toDay) }))
      }
    }

    const { data, total } = await this.orderRepository.findAndCount({
      where: whereCondition,
      relations: ['sender', 'receiver', 'lockerSlot'],
      order: { start_time: 'DESC' },
      skip: (page - 1) * limit,
      take: limit
    })
    const orders = data.map(toOrderDTO)
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: orders
    }
  }

  async getOrdersByShipperId(
    shipperId: number,
    status: string = 'all',
    page: number = 1,
    limit: number = 6,
    code?: string,
    from?: string,
    to?: string
  ) {
    const whereCondition: FindOptionsWhere<Order> = {
      sender: { id: shipperId }
    }

    if (status === 'pending') {
      whereCondition.status = OrderStatus.PENDING
    } else if (status === 'received') {
      whereCondition.status = OrderStatus.RECEIVED
    }

    if (code) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(whereCondition as any).order_code = Like(`%${code}%`)
    }

    if (from || to) {
      const fromDay = from ? dayjs(from).startOf('day').toDate() : undefined
      const toDay =
        to || from
          ? dayjs(to || from)
              .endOf('day')
              .toDate()
          : undefined

      if (fromDay && toDay) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(whereCondition as any).start_time = Between(fromDay, toDay)
      } else if (fromDay) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(whereCondition as any).start_time = MoreThanOrEqual(fromDay)
      } else if (toDay) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(whereCondition as any).start_time = LessThanOrEqual(toDay)
      }
    }

    const { data, total } = await this.orderRepository.findAndCount({
      where: whereCondition,
      relations: ['sender', 'receiver', 'lockerSlot'],
      order: { start_time: 'DESC' },
      skip: (page - 1) * limit,
      take: limit
    })

    const orders = data.map(toOrderDTO)

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: orders
    }
  }

  async getOrderStatsLast7Days(userId: number) {
    const shipperOrders = await this.orderRepository.countShipperOrdersLast7Days(userId)
    const userOrders = await this.orderRepository.countUserOrdersLast7Days(userId)

    const results: { date: string; shipperOrders: number; userOrders: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      results.push({
        date: dateStr,
        shipperOrders: shipperOrders.get(dateStr) ?? 0,
        userOrders: userOrders.get(dateStr) ?? 0
      })
    }

    return results
  }

  async createSendPackageOrder(userId: number, sendData: SendPackageDto) {
    const { lockerId, receiveDateTime, orderCode: providedOrderCode, receiverPhoneNumber, size } = sendData

    const sender = await this.userRepository.findById(userId)
    if (!sender) {
      throw ApiError.badRequest(ErrorMessages.USER_NOT_FOUND)
    }
    const receiver = await this.userRepository.findOneByCondition({ phone: receiverPhoneNumber })

    const receiveTimeDayjs = dayjs(receiveDateTime)
    const now = dayjs()
    const durationHours = receiveTimeDayjs.diff(now, 'hour', true)
    const MINIMUM_DURATION_HOURS = 1

    if (durationHours < MINIMUM_DURATION_HOURS) {
      throw ApiError.badRequest(`Thời gian nhận hàng phải tối thiểu sau ${MINIMUM_DURATION_HOURS} giờ kể từ hiện tại.`)
    }
    if (receiveTimeDayjs.isBefore(now)) {
      throw ApiError.badRequest('Thời gian nhận hàng không hợp lệ. Phải là thời gian trong tương lai.')
    }
    const billedDurationHours = Number(durationHours.toFixed(2))

    return await AppDataSource.transaction(async (manager: EntityManager) => {
      const lockerSlot = await manager.findOne(LockerSlot, {
        where: {
          locker: { id: lockerId },
          size: size,
          status: SlotStatus.EMPTY
        },
        relations: ['locker', 'locker.building'],
        lock: { mode: 'pessimistic_write' }
      })

      if (!lockerSlot) {
        throw ApiError.notFound('Không tìm thấy slot trống phù hợp với kích thước đã chọn trong tủ này.')
      }
      if (lockerSlot.status !== SlotStatus.EMPTY) {
        throw ApiError.badRequest(ErrorMessages.SLOT_ALREADY_RENTED)
      }
      if (lockerSlot.locker.status !== LockerStatus.Active) {
        throw ApiError.badRequest(ErrorMessages.LOCKER_INACTIVE)
      }

      const pricePerTime = this.getPricePerSlotSize(lockerSlot.size)
      const totalCost = billedDurationHours * pricePerTime

      const senderWithWallet = await manager.findOne(User, {
        where: { id: sender.id } as FindOptionsWhere<User>,
        relations: ['wallet'],
        lock: { mode: 'pessimistic_write' }
      })

      if (!senderWithWallet || !senderWithWallet.wallet) {
        throw ApiError.internal('Không tìm thấy thông tin ví của người dùng.')
      }

      if (senderWithWallet.wallet.balance < totalCost) {
        throw ApiError.badRequest(ErrorMessages.INSUFFICIENT_FUNDS)
      }

      senderWithWallet.wallet.balance -= totalCost
      await manager.save(senderWithWallet.wallet)

      const generatedOrderCode = providedOrderCode || `SEND-${lockerSlot.id}-${Date.now().toString().slice(-6)}`

      const walletTransaction = manager.create(WalletTransaction, {
        type: TransactionType.DEBIT,
        wallet: senderWithWallet.wallet,
        amount: totalCost,
        description: `Thanh toán gửi hàng: ${generatedOrderCode} (${billedDurationHours} giờ)`
      })
      await manager.save(walletTransaction)

      const order = manager.create(Order, {
        sender: sender,
        order_code: generatedOrderCode,
        receiver: receiver,
        receiver_phone: receiver?.phone || receiverPhoneNumber,
        lockerSlot,
        start_time: now.toDate(),
        end_time: receiveTimeDayjs.toDate(),
        status: OrderStatus.SENDING,
        type: OrderType.SEND_PACKAGE,
        payment_status: PaymentStatus.PAID,
        fee: totalCost,
        transaction: walletTransaction
      })

      const savedOrder = await manager.save(order)
      const orderLite = toOrderDTO(savedOrder)

      lockerSlot.status = SlotStatus.OCCUPIED
      await manager.save(lockerSlot)

      const { ...slotOnly } = lockerSlot

      const senderNotification = manager.create(Notification, {
        userId: sender.id,
        user: sender,
        type: NotificationType.ORDER_CREATED,
        title: `Đơn hàng ${generatedOrderCode} đã được tạo thành công`,
        message: `Đơn hàng gửi hàng cho ${receiverPhoneNumber} đã được thanh toán ${totalCost} VND.`,
        isRead: false,
        data: { orderCode: generatedOrderCode, totalCost, receiverPhoneNumber, role: 'sender' }
      })
      await manager.save(senderNotification)

      if (receiver) {
        const receiverNotification = manager.create(Notification, {
          userId: receiver.id,
          user: receiver,
          type: NotificationType.ORDER_RECEIVED,
          title: `Bạn có gói hàng mới từ ${sender.name}`,
          message: `Bạn có một gói hàng mới tại tủ khóa. Mã đơn hàng: ${generatedOrderCode}. Vui lòng nhận hàng trước ${receiveTimeDayjs.format('HH:mm DD/MM')}.`,
          isRead: false,
          data: {
            orderId: savedOrder.id,
            senderPhone: sender.phone,
            receiveTime: receiveTimeDayjs.toISOString(),
            role: 'receiver'
          }
        })
        await manager.save(receiverNotification)
      }

      // try {
      //   await this.mqttService.sendCommand(lockerSlot.locker.id, lockerSlot.id, lockerSlot.hw_index, 'OPEN')
      // } catch {
      //   throw ApiError.badRequest('Không thể mở khóa thiết bị, vui lòng thử lại.')
      // }

      if (orderLite.receiver?.id) {
        this.socketService.emitToUser(orderLite.receiver?.id, 'order:created', orderLite)
      }
      this.socketService.emitToUser(orderLite.sender?.id, 'order:created', orderLite)
      this.socketService.emitToUser(orderLite.sender?.id, 'wallet:updated', walletTransaction.wallet)
      console.log(walletTransaction)
      this.socketService.emitToUser(userId, 'transaction:created', walletTransaction)

      if (lockerSlot.locker.building?.isPublic) {
        this.socketService.emitToAll('slot:updated', slotOnly)
      } else {
        this.socketService.emitToAll('slot:updated', slotOnly)
      }

      return orderLite
    })
  }

  async openOrder(user: User, orderId: number) {
    const order = await this.orderRepository.findById(orderId, {
      relations: ['lockerSlot', 'sender', 'receiver', 'lockerSlot.locker']
    })

    if (!order) throw ApiError.notFound('Đơn hàng không tồn tại.')
    if (order.receiver_phone !== user.phone) {
      throw ApiError.unauthorized('Bạn không có quyền mở đơn hàng này.')
    }

    const lockerSlot = order.lockerSlot
    if (!lockerSlot) throw ApiError.badRequest('Không tìm thấy ngăn tủ cho đơn hàng này.')

    if (lockerSlot.status === SlotStatus.MAINTENANCE) {
      throw ApiError.badRequest('Ngăn tủ đang bảo trì, không thể mở.')
    }
    if (lockerSlot.status === SlotStatus.EMPTY) {
      throw ApiError.badRequest('Ngăn tủ hiện đang trống, không thể mở.')
    }

    // try {
    //   await this.mqttService.sendCommand(lockerSlot.locker.id, lockerSlot.id, lockerSlot.hw_index, 'OPEN')
    // } catch {
    //   throw ApiError.badRequest('Không thể mở khóa thiết bị, vui lòng thử lại.')
    // }

    order.status = OrderStatus.RECEIVED
    lockerSlot.status = SlotStatus.EMPTY

    const { savedOrder, savedLockerSlot, receiverNotification, senderNotification } = await AppDataSource.transaction(
      async (manager) => {
        const savedOrder = await manager.save(order)
        const savedLockerSlot = await manager.save(lockerSlot)

        const receiverNotification = manager.create(Notification, {
          userId: user.id,
          user: user,
          type: NotificationType.ORDER_RECEIVED,
          title: `Bạn đã nhận thành công đơn hàng ${order.order_code}`,
          message: `Bạn đã nhận thành công gói hàng từ ${order.sender.name}.`,
          isRead: false,
          data: { orderId: order.id, role: 'receiver' }
        })
        await manager.save(receiverNotification)

        let senderNotification = null
        if (order.sender && order.type === OrderType.SEND_PACKAGE) {
          senderNotification = manager.create(Notification, {
            userId: order.sender.id,
            user: order.sender,
            type: NotificationType.ORDER_RECEIVED,
            title: `Đơn hàng ${order.id} đã được nhận`,
            message: `Người nhận (${user.name}) đã nhận gói hàng của bạn.`,
            isRead: false,
            data: { orderId: order.id, role: 'sender' }
          })
          await manager.save(senderNotification)
        }

        return { savedOrder, savedLockerSlot, receiverNotification, senderNotification }
      }
    )
    const orderDTO = toOrderDTO(savedOrder)
    const { ...slotOnly } = savedLockerSlot

    this.socketService.emitToUser(user.id, 'order:updated', orderDTO)
    if (order.sender?.id) {
      this.socketService.emitToUser(order.sender.id, 'order:updated', orderDTO)
    }

    this.socketService.emitToUser(user.id, 'notification:created', receiverNotification)
    if (senderNotification && order.sender?.id) {
      this.socketService.emitToUser(order.sender.id, 'notification:created', senderNotification)
    }

    this.socketService.emitToAll('slot:updated', slotOnly)

    return orderDTO
  }

  async createRentalOrder(user: User, rentData: RentLockerDto) {
    const { lockerId, receiveDateTime, size } = rentData
    const receiveTimeDayjs = dayjs(receiveDateTime)
    const now = dayjs()
    const durationHours = receiveTimeDayjs.diff(now, 'hour', true)
    const MINIMUM_DURATION_HOURS = 1

    if (durationHours < MINIMUM_DURATION_HOURS) {
      throw ApiError.badRequest(`Thời gian thuê phải tối thiểu sau ${MINIMUM_DURATION_HOURS} giờ kể từ hiện tại.`)
    }
    if (receiveTimeDayjs.isBefore(now)) {
      throw ApiError.badRequest('Thời gian nhận tủ không hợp lệ. Phải là thời gian trong tương lai.')
    }

    const billedDurationHours = Number(durationHours.toFixed(2))

    return await AppDataSource.transaction(async (manager: EntityManager) => {
      const lockerSlot = await manager.findOne(LockerSlot, {
        where: {
          locker: { id: lockerId },
          size: size,
          status: SlotStatus.EMPTY
        },
        relations: ['locker', 'locker.building'],
        lock: { mode: 'pessimistic_write' }
      })

      if (!lockerSlot) {
        throw ApiError.notFound('Không tìm thấy slot trống phù hợp với kích thước đã chọn trong tủ này.')
      }
      if (lockerSlot.status !== SlotStatus.EMPTY) {
        throw ApiError.badRequest(ErrorMessages.SLOT_ALREADY_RENTED)
      }
      if (lockerSlot.locker.status !== LockerStatus.Active) {
        throw ApiError.badRequest(ErrorMessages.LOCKER_INACTIVE)
      }

      const pricePerTime = this.getPricePerSlotSize(lockerSlot.size)
      const totalCost = Math.ceil(billedDurationHours * pricePerTime)

      const renterWithWallet = await manager.findOne(User, {
        where: { id: user.id },
        relations: ['wallet'],
        lock: { mode: 'pessimistic_write' }
      })

      if (!renterWithWallet || !renterWithWallet.wallet) {
        throw ApiError.internal('Không tìm thấy thông tin ví của người dùng.')
      }

      if (renterWithWallet.wallet.balance < totalCost) {
        throw ApiError.badRequest(ErrorMessages.INSUFFICIENT_FUNDS)
      }

      renterWithWallet.wallet.balance -= totalCost
      await manager.save(renterWithWallet.wallet)

      const walletTransaction = manager.create(WalletTransaction, {
        type: TransactionType.DEBIT,
        wallet: renterWithWallet.wallet,
        amount: totalCost,
        description: `Thanh toán thuê tủ: ${lockerSlot.locker.code} (${billedDurationHours} giờ)`
      })
      await manager.save(walletTransaction)

      const generatedOrderCode = `RENT-${Date.now().toString().slice(-6)}`

      const order = manager.create(Order, {
        sender: user,
        order_code: generatedOrderCode,
        receiver: user,
        receiver_phone: user.phone,
        lockerSlot,
        start_time: now.toDate(),
        end_time: receiveTimeDayjs.toDate(),
        status: OrderStatus.SENDING,
        type: OrderType.RENT_LOCKER,
        payment_status: PaymentStatus.PAID,
        fee: totalCost,
        transaction: walletTransaction
      })

      const savedOrder = await manager.save(order)
      const orderLite = toOrderDTO(savedOrder)

      lockerSlot.status = SlotStatus.OCCUPIED
      await manager.save(lockerSlot)

      const { ...slotOnly } = lockerSlot

      const rentalNotification = manager.create(Notification, {
        userId: user.id,
        user: user,
        type: NotificationType.ORDER_CREATED,
        title: `Thuê tủ ${generatedOrderCode} thành công`,
        message: `Bạn đã thuê tủ ${lockerSlot.locker.code} thành công. Vui lòng sử dụng trước ${receiveTimeDayjs.format('HH:mm DD/MM')}.`,
        isRead: false,
        data: { orderId: savedOrder.id, totalCost, role: 'renter' }
      })
      await manager.save(rentalNotification)

      // try {
      //   await this.mqttService.sendCommand(lockerSlot.locker.id, lockerSlot.id, lockerSlot.hw_index, 'OPEN')
      // } catch {
      //   throw ApiError.badRequest('Không thể mở khóa thiết bị, vui lòng thử lại.')
      // }

      this.socketService.emitToUser(orderLite.sender?.id, 'order:created', orderLite)
      this.socketService.emitToUser(orderLite.sender?.id, 'wallet:updated', renterWithWallet.wallet)
      this.socketService.emitToUser(user.id, 'transaction:created', walletTransaction)
      this.socketService.emitToUser(user.id, 'notification:created', rentalNotification)
      this.socketService.emitToAll('slot:updated', slotOnly)

      return orderLite
    })
  }
}
