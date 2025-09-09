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
  WalletTransactionController: Symbol.for('WalletTransactionController')
}

export default TYPES
