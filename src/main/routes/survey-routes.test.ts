import request from 'supertest'
import app from '../config/app'
import { MongoHelper } from '../../infra/db/mongodb/helpers/mogo-helper'
import { type Collection } from 'mongodb'
import { hash } from 'bcrypt'

let surveysCollection: Collection

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
    surveysCollection = await MongoHelper.getCollection('accounts')
    await surveysCollection.deleteMany({})
  })

  describe('POST /surveys', () => {
    test('Should return 204 on add survey success', async () => {
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
        .expect(204)
    })
  })

})
