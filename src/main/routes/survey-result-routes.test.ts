import request from 'supertest'
import app from '../config/app'
import env from '../config/env'
import { MongoHelper } from '@/infra/db/mongodb/helpers/mogo-helper'
import { type Collection } from 'mongodb'
import { hash } from 'bcrypt'
import { sign } from 'jsonwebtoken'

const makeAccessToken = async (): Promise<string> => {
  const accountData = {
    name: 'name',
    email: 'email@mail.com',
    password: await hash('password', 12)
  }
  const insertReturn = await accountsCollection.insertOne(accountData)
  const id = insertReturn.insertedId.toString()
  const accessToken = sign({ id }, env.jwtSecret)
  await accountsCollection.updateOne({ _id: insertReturn.insertedId }, {
    $set: {
      accessToken
    }
  })

  return accessToken
}

let surveysCollection: Collection
let accountsCollection: Collection

describe('Survey Results Routes', () => {
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

  describe('PUT /surveys/:surveyId/results', () => {
    test('Should return 403 on save survey result with invalid surveyId', async () => {
      await request(app)
        .put('/api/surveys/id/results')
        .send({
          answer: 'answer'
        })
        .expect(403)
    })

    test('Should return 403 on add survey with wrong accessToken', async () => {
      const survey = await surveysCollection.insertOne({
        question: 'Question',
        answers: [{
          image: 'Image',
          answer: 'answer'
        }, {
          answer: 'answer2'
        }],
        date: new Date()
      })

      const surveyId = survey.insertedId.toString()

      await request(app)
        .put(`/api/surveys/${surveyId}/results`)
        .set('x-access-token', 'invalidToken')
        .send({
          answer: 'answer'
        })
        .expect(403)
    })

    test('Should return 403 on wrong answer', async () => {
      const accessToken = await makeAccessToken()

      const survey = await surveysCollection.insertOne({
        question: 'Question',
        answers: [{
          image: 'Image',
          answer: 'answer'
        }, {
          answer: 'answer2'
        }],
        date: new Date()
      })

      const surveyId = survey.insertedId.toString()

      await request(app)
        .put(`/api/surveys/${surveyId}/results`)
        .set('x-access-token', accessToken)
        .send({
          answer: 'wrongAnswer'
        })
        .expect(403)
    })

    test('Should return 204 on add survey success', async () => {
      const accessToken = await makeAccessToken()
      const survey = await surveysCollection.insertOne({
        question: 'Question',
        answers: [{
          image: 'Image',
          answer: 'answer'
        }, {
          answer: 'answer2'
        }],
        date: new Date()
      })

      const surveyId = survey.insertedId.toString()

      await request(app)
        .put(`/api/surveys/${surveyId}/results`)
        .set('x-access-token', accessToken)
        .send({
          answer: 'answer'
        })
        .expect(200)
    })
  })
})
