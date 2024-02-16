import { type LoadAccountByTokenRepository } from '../../protocols/db/account/load-account-by-token-repository'
import { type AccountModel, type Decrypter, type LoadAccountByToken } from './db-load-account-by-token-protocols'

export class DbLoadAccountByToken implements LoadAccountByToken {
  constructor (
    private readonly decrypter: Decrypter,
    private readonly loadAccountByTokenRepository: LoadAccountByTokenRepository
  ) { }

  async load (accessToken: string, role?: string): Promise<AccountModel | null> {
    const token = await this.decrypter.decrypt(accessToken)
    console.log(`token: ${token} e accessToken: ${accessToken}`)
    if (token) {
      const account = await this.loadAccountByTokenRepository.loadByToken(accessToken, role)
      return account
    }
    return null
  }
}
