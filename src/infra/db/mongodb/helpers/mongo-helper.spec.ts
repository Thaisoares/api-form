import { MongoHelper as sut } from './mogo-helper'

describe('Mongo Helper', () => {
  beforeAll(async () => {
    if (process.env.MONGO_URL) {
      await sut.connect(process.env.MONGO_URL)
    }
  })

  afterAll(async () => {
    await sut.disconnect()
  })

  test('Should reconnect if mongo db is down', () => {
    const accountCollection = sut.getCollection('accounts')
    expect(accountCollection).toBeTruthy()
  })
})
