import { MongoHelper } from '../helpers/mogo-helper'
import { type Collection } from 'mongodb'
import { SurveyMongoRepository } from './survey-mongo-repository'
import { type AddSurveyModel } from '../../../../domain/usecases/add-survey'
import { ObjectId } from 'mongodb'

let surveysCollection: Collection

const survey: AddSurveyModel = {
  question: 'question',
  answers: [{
    image: 'image',
    answer: 'answer'
  }, {
    answer: 'answer2'
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

  test('Should return surveys on success of loadAll', async () => {
    const sut = makeSut()
    await surveysCollection.insertOne({ ...survey, _id: new ObjectId('65c3ce0390cbb2ba1aee5db1') })
    await surveysCollection.insertOne({ ...survey, _id: new ObjectId('65c3ce0390cbb2ba1aee5db2') })
    const surveys = await sut.loadAll()
    expect(surveys).toHaveLength(2)
    expect(surveys[0]).toHaveProperty('question')
    expect(surveys[0]).toHaveProperty('answers')
    expect(surveys[0]).toHaveProperty('date')
  })

  test('Should return empty list when no survey on db', async () => {
    const sut = makeSut()
    const surveys = await sut.loadAll()
    expect(surveys).toHaveLength(0)
  })
})
