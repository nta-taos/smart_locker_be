const TYPES = {
  // user
  UserRepository: Symbol.for('UserRepository'),
  UserService: Symbol.for('UserService'),
  UserController: Symbol.for('UserController'),

  // auth
  AuthService: Symbol.for('AuthService'),
  AuthController: Symbol.for('AuthController'),

  // building
  BuildingRepository: Symbol.for('BuildingRepository')
}

export default TYPES
