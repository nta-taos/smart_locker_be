import { WalletTransaction } from '@/entities/wallet-transaction.model'

import { IBaseRepository } from './base.repository.interface'

export interface IWalletTransactionRepository extends IBaseRepository<WalletTransaction> {
  /**
   * Retrieve a list of wallet transactions for a specific user.
   * Supports pagination through page and limit parameters.
   *
   * @param userId - The ID of the user whose transactions are being retrieved.
   * @param page - The page number to retrieve (default: 1).
   * @param limit - The number of transactions per page (default: 10).
   * @returns An object containing:
   *   - transactions: An array of WalletTransaction entities.
   *   - total: The total number of transactions for the user.
   */
  findByUserId(
    userId: number,
    page?: number,
    limit?: number
  ): Promise<{ transactions: WalletTransaction[]; total: number }>
}
