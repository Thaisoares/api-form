import request from 'supertest'
import app from '../config/app'
import { MongoHelper } from '../../infra/db/mongodb/helpers/mogo-helper'
import { type Collection } from 'mongodb'
import { hash } from 'bcrypt'

let accountCollection: Collection

describe('Login Routes', () => {
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

  describe('POST /singup', () => {
    test('Should return 200 on singup', async () => {
      await request(app)
        .post('/api/singup')
        .send({
          name: 'name',
          email: 'name@mail.com',
          password: 'password',
          passwordConfirmation: 'password'
        })
        .expect(200)
    })
  })

  describe('POST /login', () => {
    test('Should return 200 on login', async () => {
      const email = 'name@mail.com'
      const password = 'password'

      await accountCollection.insertOne({
        name: 'name',
        email,
        password: await hash(password, 12)
      })

      await request(app)
        .post('/api/login')
        .send({ email, password })
        .expect(200)
    })

    test('Should return 401 on login of non existent', async () => {
      await request(app)
        .post('/api/login')
        .send({
          email: 'name@mail.com',
          password: 'password'
        })
        .expect(401)
    })
  })
})
