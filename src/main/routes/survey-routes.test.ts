import request from 'supertest'
import app from '../config/app'
import env from '../config/env'
import { MongoHelper } from '@/infra/db/mongodb/helpers/mogo-helper'
import { type AddSurveyModel } from '@/domain/usecases/add-survey'
import { type Collection, ObjectId } from 'mongodb'
import { hash } from 'bcrypt'
import { sign } from 'jsonwebtoken'

const makeAccessToken = async (role?: string): Promise<string> => {
  let accountData = {
    name: 'name',
    email: 'email@mail.com',
    password: await hash('password', 12)
  }
  if (role) accountData = Object.assign(accountData, { role })

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
      await makeAccessToken()

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
      const accessToken = await makeAccessToken()

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
      const accessToken = await makeAccessToken('admin')

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

  describe('GET /surveys', () => {
    const survey: AddSurveyModel = {
      question: 'question',
      answers: [{
        image: 'image',
        answer: 'answer'
      }],
      date: new Date()
    }

    test('Should return 403 on load survey without accessToken', async () => {
      await request(app)
        .get('/api/surveys')
        .send({})
        .expect(403)
    })

    test('Should return 403 on add survey with wrong accessToken', async () => {
      await makeAccessToken()

      await request(app)
        .get('/api/surveys')
        .set('x-access-token', 'invalidToken')
        .send({})
        .expect(403)
    })

    test('Should return 200 and all surveys on load survey success', async () => {
      const accessToken = await makeAccessToken()

      await surveysCollection.insertMany([{ ...survey, _id: new ObjectId('65c3ce0390cbb2ba1aee5db1') },
        { ...survey, _id: new ObjectId('65c3ce0390cbb2ba1aee5db2') },
        { ...survey, _id: new ObjectId('65c3ce0390cbb2ba1aee5db3') }])

      const response = await request(app)
        .get('/api/surveys')
        .set('x-access-token', accessToken)

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('surveys')
      expect(response.body.surveys).toHaveLength(3)
    })

    test('Should return 204 if no survey on db', async () => {
      const accessToken = await makeAccessToken()

      await request(app)
        .get('/api/surveys')
        .set('x-access-token', accessToken)
        .expect(204)
    })
  })
})
