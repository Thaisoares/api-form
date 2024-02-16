import { MongoHelper } from '../helpers/mogo-helper'
import { type Collection } from 'mongodb'
import { SurveyMongoRepository } from './survey-mongo-repository'
import { type AddSurveyModel } from '../../../../domain/usecases/add-survey'

let surveysCollection: Collection

const survey: AddSurveyModel = {
  question: 'question',
  answers: [{
    image: 'image',
    answer: 'answer'
  }, {
    answer: 'answer'
  }],
  date: new Date()
}

const makeSut = (): SurveyMongoRepository => {
  const sut = new SurveyMongoRepository()
  return sut
}

describe('Survey Mongo Repository', () => {
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
  })

  test('Should add one survey on success of add', async () => {
    const sut = makeSut()
    const beforeCount = await surveysCollection.countDocuments()
    await sut.add(survey)
    const currentCount = await surveysCollection.countDocuments()
    expect(currentCount).toBe(beforeCount + 1)
  })
})
