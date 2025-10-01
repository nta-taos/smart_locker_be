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
  RedisService: Symbol.for('RedisService')
}

export default TYPES
