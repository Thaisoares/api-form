import { DbAddAccount } from "../../../data/usecases/add-account/db-add-account"
import { AddAccount } from "../../../domain/usecases/add-account"
import { BcryptAdapter } from "../../../infra/criptography/bcrypt-adapter/bcrypt-adapter"
import { AccountMongoRepository } from "../../../infra/db/mongodb/account-repository/account-mongo-repository"


export const makeDbAddAccount = (): AddAccount => {
  const salt = 12
  const hasher = new BcryptAdapter(salt)
  const addAccountRepository = new AccountMongoRepository()

  return new DbAddAccount(hasher, addAccountRepository, addAccountRepository)
}