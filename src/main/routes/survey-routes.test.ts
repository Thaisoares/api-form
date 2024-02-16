import request from 'supertest'
import app from '../config/app'
import { MongoHelper } from '../../infra/db/mongodb/helpers/mogo-helper'
import { type Collection } from 'mongodb'
import { hash } from 'bcrypt'
import { sign } from 'jsonwebtoken'
import env from '../config/env'

let surveysCollection: Collection
let accountsCollection: Collection

describe('Survey Routes', () => {
  beforeAll(async () => {
    if (process.env.MONGO_URL) {
      await MongoHelper.connect(process.env.MONGO_URL)
    }
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    surveysCollection = await MongoHelper.getCollection('surveys')
    await surveysCollection.deleteMany({})

    accountsCollection = await MongoHelper.getCollection('accounts')
    await accountsCollection.deleteMany({})
  })

  describe('POST /surveys', () => {
    test('Should return 403 on add survey without accessToken', async () => {
      await request(app)
        .post('/api/surveys')
        .send({
          question: 'Question',
          answer: [{
            image: 'Image',
            answer: 'Answer 1'
          }, {
            answer: 'answer 2'
          }]
        })
        .expect(403)
    })

    test('Should return 403 on add survey with wrong accessToken', async () => {
      const insertReturn = await accountsCollection.insertOne({
        name: 'name',
        email: 'email@mail.com',
        password: await hash('password', 12)
      })
      const id = insertReturn.insertedId.toString()
      const accessToken = sign({ id }, env.jwtSecret)
      await accountsCollection.updateOne({ _id: insertReturn.insertedId }, {
        $set: {
          accessToken
        }
      })

      await request(app)
        .post('/api/surveys')
        .set('x-access-token', 'invalidToken')
        .send({
          question: 'Question',
          answer: [{
            image: 'Image',
            answer: 'Answer 1'
          }, {
            answer: 'answer 2'
          }]
        })
        .expect(403)
    })

    test('Should return 403 on add survey from user not admin', async () => {
      const insertReturn = await accountsCollection.insertOne({
        name: 'name',
        email: 'email@mail.com',
        password: await hash('password', 12)
      })
      const id = insertReturn.insertedId.toString()
      const accessToken = sign({ id }, env.jwtSecret)
      await accountsCollection.updateOne({ _id: insertReturn.insertedId }, {
        $set: {
          accessToken
        }
      })

      await request(app)
        .post('/api/surveys')
        .set('x-access-token', accessToken)
        .send({
          question: 'Question',
          answer: [{
            image: 'Image',
            answer: 'Answer 1'
          }, {
            answer: 'answer 2'
          }]
        })
        .expect(403)
    })

    test('Should return 204 on add survey success', async () => {
      const insertReturn = await accountsCollection.insertOne({
        name: 'name',
        email: 'email@mail.com',
        password: await hash('password', 12),
        role: 'admin'
      })
      const id = insertReturn.insertedId.toString()
      const accessToken = sign({ id }, env.jwtSecret)
      await accountsCollection.updateOne({ _id: insertReturn.insertedId }, {
        $set: {
          accessToken
        }
      })

      await request(app)
        .post('/api/surveys')
        .set('x-access-token', accessToken)
        .send({
          question: 'Question',
          answer: [{
            image: 'Image',
            answer: 'Answer 1'
          }, {
            answer: 'answer 2'
          }]
        })
        .expect(204)
    })
  })
})
