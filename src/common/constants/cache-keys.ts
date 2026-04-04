export const CacheKeys = {
  PUBLIC_BUILDINGS: 'public_buildings',
  USER_BUILDINGS: (userId: number) => `user_buildings_${userId}`,
  USER: (userId: number) => `user:${userId}`,
  BLACKLIST_TOKEN: (token: string) => `blacklist:${token}`,
  WALLET_TRANSACTIONS: (userId: number, page: number, limit: number) => `wallet-transaction:${userId}:${page}:${limit}`,
  PASSWORD_RESET: (token: string) => `password-reset:${token}`
}
