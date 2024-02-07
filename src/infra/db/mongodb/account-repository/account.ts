import { type AddAccountRepository } from '../../../../data/protocols/add-account-repository'
import { type AccountModel } from '../../../../domain/models/account'
import { type AddAccountModel } from '../../../../domain/usecases/add-account'
import { InsertError } from '../errors'
import { MongoHelper } from '../helpers/mogo-helper'

export class AccountMongoRepository implements AddAccountRepository {
  async add (accountData: AddAccountModel): Promise<AccountModel> {
    const accountCollection = MongoHelper.getCollection('accounts')
    const result = await accountCollection.insertOne(accountData)
    if (result.acknowledged) {
      // const insertedId = result.insertedId.id.toString()
      // const accountModel: AccountModel = { ...accountData, id: insertedId }
      return await new Promise(resolve => { resolve(MongoHelper.map(accountData)) })
    }
    throw new InsertError()
  }
}