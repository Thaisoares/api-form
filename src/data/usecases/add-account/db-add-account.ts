import { type AccountModel, type AddAccount, type AddAccountModel, type Hasher, type AddAccountRepository, LoadAccountByEmailRepository } from './db-add-account-protocols'

export class DbAddAccount implements AddAccount {
  constructor (
    private readonly hasher: Hasher,
    private readonly addAccountRepository: AddAccountRepository,
    private readonly loadAccountByEmailRepository: LoadAccountByEmailRepository,
  ) { }

  async add (account: AddAccountModel): Promise<AccountModel|null> {
    const existingAccount = await this.loadAccountByEmailRepository.loadByEmail(account.email)
    if(existingAccount) return null
    
    const hashPassword = await this.hasher.hash(account.password)
    return await this.addAccountRepository.add({
      ...account,
      password: hashPassword
    })
  }
}
