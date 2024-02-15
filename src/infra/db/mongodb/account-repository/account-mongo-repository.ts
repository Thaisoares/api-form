import { type AddAccountRepository } from '../../../../data/protocols/db/account/add-account-repository'
import { type LoadAccountByEmailRepository } from '../../../../data/protocols/db/account/load-account-by-email-repository'
import { type UpdateAccessTokenRepository } from '../../../../data/protocols/db/account/update-access-token-repository'
import { type AccountModel } from '../../../../domain/models/account'
import { type AddAccountModel } from '../../../../domain/usecases/add-account'
import { InsertError } from '../errors'
import { MongoHelper } from '../helpers/mogo-helper'
import { ObjectId } from 'mongodb'

export class AccountMongoRepository implements AddAccountRepository, LoadAccountByEmailRepository, UpdateAccessTokenRepository {
  async add (accountData: AddAccountModel): Promise<AccountModel|null> {
    const accountCollection = await MongoHelper.getCollection('accounts')
    const result = await accountCollection.insertOne(accountData)
    if (result.acknowledged) {
      return MongoHelper.map(accountData)
    }
    throw new InsertError('accounts')
  }

  async loadByEmail (email: string): Promise<AccountModel | null> {
    const accountCollection = await MongoHelper.getCollection('accounts')
    const account = await accountCollection.findOne({ email })
    return account && MongoHelper.map(account)
  }

  async updateAccessToken (id: string, token: string): Promise<void> {
    const accountCollection = await MongoHelper.getCollection('accounts')
    const objectId = new ObjectId(id)
    await accountCollection.updateOne({ _id: objectId }, {
      $set: {
        accessToken: token
      }
    })
  }
}
