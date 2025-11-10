const TYPES = {
  // user
  UserRepository: Symbol.for('UserRepository'),
  UserService: Symbol.for('UserService'),
  UserController: Symbol.for('UserController'),

  // auth
  AuthService: Symbol.for('AuthService'),
  AuthController: Symbol.for('AuthController'),

  // building
  BuildingRepository: Symbol.for('BuildingRepository'),
  BuildingService: Symbol.for('BuildingService'),
  BuildingController: Symbol.for('BuildingController'),

  // wallet transaction
  WalletTransactionRepository: Symbol.for('WalletTransactionRepository'),
  WalletTransactionService: Symbol.for('WalletTransactionService'),
  WalletTransactionController: Symbol.for('WalletTransactionController'),

  // order
  OrderRepository: Symbol.for('OrderRepository'),
  OrderService: Symbol.for('OrderService'),
  OrderController: Symbol.for('OrderController'),

  // Locker slot
  LockerSlotRepository: Symbol.for('LockerSlotRepository'),

  // uploand
  ImageUploadService: Symbol.for('ImageUploadService'),

  // Socket
  SocketService: Symbol.for('SocketService'),
  SocketServer: Symbol.for('SocketServer'),

  // MQTT
  MQTTService: Symbol.for('MQTTService'),
  MQTTConfig: Symbol.for('MQTTConfig'),

  // redis
  RedisService: Symbol.for('RedisService'),

  // Notification slot
  NotificationRepository: Symbol.for('NotificationRepository'),
  NotificationController: Symbol.for('NotificationController'),
  NotificationService: Symbol.for('NotificationService'),

  // Order Authorization
  OrderAuthorizationRepository: Symbol.for('OrderAuthorizationRepository'),
  OrderAuthorizationService: Symbol.for('OrderAuthorizationService'),
  OrderAuthorizationController: Symbol.for('OrderAuthorizationController'),

  // PayOS
  PayosService: Symbol.for('PayosService'),
  PayosController: Symbol.for('PayosController'),

  // Mail
  MailService: Symbol.for('MailService')
}

export default TYPES
