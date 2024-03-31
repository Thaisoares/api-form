import { type AccountModel, type AddAccountParams } from '@/data/usecases/account/add-account/db-add-account-protocols'

export interface AddAccountRepository {
  add: (accountData: AddAccountParams) => Promise<AccountModel | null>
}
