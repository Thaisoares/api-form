import { AccountMongoRepository } from './account'
import { MongoHelper } from '../helpers/mogo-helper'

describe('Account Mongo Repository', () => {
  beforeAll(async () => {
    if (process.env.MONGO_URL) {
      await MongoHelper.connect(process.env.MONGO_URL)
    }
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    const accountCollection = await MongoHelper.getCollection('accounts')
    await accountCollection.deleteMany({})
  })

  const makeSut = (): AccountMongoRepository => {
    const sut = new AccountMongoRepository()
    return sut
  }

  test('Should return an account on success', async () => {
    const sut = makeSut()

    const name = 'name'
    const email = 'email@mail.com'
    const password = 'password'

    const account = await sut.add({ name, email, password })

    expect(account).toBeTruthy()
    expect(account.id).toBeTruthy()
    expect(account.name).toBe(name)
    expect(account.email).toBe(email)
    expect(account.password).toBe(password)
  })
})
