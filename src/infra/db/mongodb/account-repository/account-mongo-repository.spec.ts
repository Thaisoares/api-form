import { AccountMongoRepository } from './account-mongo-repository'
import { MongoHelper } from '../helpers/mogo-helper'
import { type Collection } from 'mongodb'

let accountCollection: Collection

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
    accountCollection = await MongoHelper.getCollection('accounts')
    await accountCollection.deleteMany({})
  })

  const name = 'name'
  const email = 'email@mail.com'
  const password = 'password'

  const makeSut = (): AccountMongoRepository => {
    const sut = new AccountMongoRepository()
    return sut
  }

  test('Should return an account on success of add', async () => {
    const sut = makeSut()

    const account = await sut.add({ name, email, password })

    expect(account).toBeTruthy()
    expect(account.id).toBeTruthy()
    expect(account.name).toBe(name)
    expect(account.email).toBe(email)
    expect(account.password).toBe(password)
  })

  test('Should return an account on success of loadByEmail', async () => {
    const sut = makeSut()
    await accountCollection.insertOne({ name, email, password })
    const account = await sut.loadByEmail(email)

    expect(account).toBeTruthy()
    expect(account?.id).toBeTruthy()
    expect(account?.name).toBe(name)
    expect(account?.email).toBe(email)
    expect(account?.password).toBe(password)
  })

  test('Should return null on fail of loadByEmail', async () => {
    const sut = makeSut()
    const account = await sut.loadByEmail(email)

    expect(account).toBeFalsy()
  })

  test('Should update the account on success of updateAcessToken', async () => {
    const sut = makeSut()
    const result = await accountCollection.insertOne({ name, email, password })
    const id = result.insertedId.toString()

    await sut.updateAccessToken(id, 'token')
    const account = await accountCollection.findOne({ _id: result.insertedId })

    expect(account).toBeTruthy()
    expect(account?.accessToken).toBe('token')
  })
})
