import { type Authentication, type AuthenticationParams, type HashComparer, type LoadAccountByEmailRepository, type Encrypter, type UpdateAccessTokenRepository } from './db-authenticate-protocols'

export class DbAuthentication implements Authentication {
  constructor (
    private readonly loadAccountByEmailRepository: LoadAccountByEmailRepository,
    private readonly hashCompare: HashComparer,
    private readonly encrypter: Encrypter,
    private readonly updateAccessTokenRepository: UpdateAccessTokenRepository
  ) {}

  async auth (authentication: AuthenticationParams): Promise<string | null> {
    const account = await this.loadAccountByEmailRepository.loadByEmail(authentication.email)
    if (account) {
      const isPasswordCorrect = await this.hashCompare.compare(authentication.password, account.password)
      if (isPasswordCorrect) {
        const token = await this.encrypter.encrypt(account.id)
        await this.updateAccessTokenRepository.updateAccessToken(account.id, token)
        return await Promise.resolve(token)
      }
    }
    return null
  }
}
