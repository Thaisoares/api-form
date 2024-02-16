import { DbLoadAccountByToken } from '../../../../data/usecases/load-account-by-token/db-load-account-by-token'
import { type LoadAccountByToken } from '../../../../domain/usecases/load-account-by-token'
import { JwtAdapter } from '../../../../infra/criptography/jwt-adapter/jwt-adapter'
import { AccountMongoRepository } from '../../../../infra/db/mongodb/account-repository/account-mongo-repository'
import env from '../../../config/env'

export const makeDbLoadAccountByToken = (): LoadAccountByToken => {
  const jwtAdapter = new JwtAdapter(env.jwtSecret)
  const addAccountRepository = new AccountMongoRepository()

  return new DbLoadAccountByToken(jwtAdapter, addAccountRepository)
}
