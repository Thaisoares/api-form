import { MongoHelper as sut } from './mogo-helper'

describe('Mongo Helper', () => {
  beforeAll(async () => {
    if (process.env.MONGO_URL) await sut.connect(process.env.MONGO_URL)
  })

  afterAll(async () => {
    await sut.disconnect()
  })

  test('Should reconnect if mongo db is down', async () => {
    await sut.disconnect()
    const accountCollection = await sut.getCollection('accounts')
    expect(accountCollection).toBeTruthy()
  })

  test('Should throw if no uri', async () => {
    await sut.disconnect()
    sut.uri = null
    const promise = sut.getCollection('accounts')
    await expect(promise).rejects.toThrow()
  })
})
