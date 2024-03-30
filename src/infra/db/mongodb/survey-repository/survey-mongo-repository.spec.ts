import { SurveyMongoRepository } from './survey-mongo-repository'
import { MongoHelper } from '../helpers/mogo-helper'
import { type AddSurveyModel } from '@/domain/usecases/survey/add-survey'
import { ObjectId, type Collection } from 'mongodb'
import { type SurveyModel } from '@/domain/models/survey'

let surveysCollection: Collection

const makeSurvey = (): AddSurveyModel => {
  return {
    question: 'question',
    answers: [{
      image: 'image',
      answer: 'answer'
    }],
    date: new Date()
  }
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

  describe('add', () => {
    test('Should add one survey on success of add', async () => {
      const sut = makeSut()
      const beforeCount = await surveysCollection.countDocuments()
      await sut.add(makeSurvey())
      const currentCount = await surveysCollection.countDocuments()
      expect(currentCount).toBe(beforeCount + 1)
    })
  })

  describe('loadAll', () => {
    test('Should return surveys on success of loadAll', async () => {
      const sut = makeSut()
      await surveysCollection.insertMany([{ ...makeSurvey(), _id: new ObjectId('65c3ce0390cbb2ba1aee5db1') },
        { ...makeSurvey(), _id: new ObjectId('65c3ce0390cbb2ba1aee5db2') }])

      const surveys = await sut.loadAll()
      console.log(surveys)
      expect(surveys).toHaveLength(2)
      expect(surveys[0]).toHaveProperty('question')
      expect(surveys[0]).toHaveProperty('answers')
      expect(surveys[0]).toHaveProperty('date')
      expect(surveys[0]).toHaveProperty('id')
    })

    test('Should return empty list when no survey on db', async () => {
      const sut = makeSut()
      const surveys = await sut.loadAll()
      expect(surveys).toHaveLength(0)
    })
  })

  describe('loadById', () => {
    test('Should return survey on success of loadById', async () => {
      const sut = makeSut()
      const id = '65c3ce0390cbb2ba1aee5db1'
      await surveysCollection.insertMany([{ ...makeSurvey(), _id: new ObjectId(id) },
        { ...makeSurvey(), _id: new ObjectId('65c3ce0390cbb2ba1aee5db2') }])

      const returnSurvey: SurveyModel = {
        ...makeSurvey(),
        id
      }
      const surveyReturn = await sut.loadById(id)
      expect(typeof surveyReturn).toBe(typeof returnSurvey)
      expect(surveyReturn?.id).toEqual(id)
    })

    test('Should return null when no survey found', async () => {
      const sut = makeSut()
      const surveyReturn = await sut.loadById('65c3ce0390cbb2ba1aee5db2')
      expect(surveyReturn).toBeNull()
    })
  })
})
