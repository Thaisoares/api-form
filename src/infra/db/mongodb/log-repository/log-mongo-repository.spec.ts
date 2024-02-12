import { MongoHelper } from '../helpers/mogo-helper'
import { type Collection } from 'mongodb'
import { LogMongoRepository } from './log-mongo-repository'

describe('Account Mongo Repository', () => {
  let errorCollection: Collection

  beforeAll(async () => {
    if (process.env.MONGO_URL) {
      await MongoHelper.connect(process.env.MONGO_URL)
    }
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    errorCollection = await MongoHelper.getCollection('errors')
    await errorCollection.deleteMany({})
  })

  const makeSut = (): LogMongoRepository => {
    const sut = new LogMongoRepository()
    return sut
  }

  test('Should return an account on success', async () => {
    const sut = makeSut()
    await sut.log('any_error')
    const count = await errorCollection.countDocuments()
    expect(count).toBe(1)
  })
})
