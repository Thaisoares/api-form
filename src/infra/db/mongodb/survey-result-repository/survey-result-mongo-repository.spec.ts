import { MongoHelper } from '../helpers/mogo-helper'
import { type AddSurveyParams } from '@/domain/usecases/survey/add-survey'
import { type Collection } from 'mongodb'
import { type AddAccountParams } from '@/domain/usecases/account/add-account'
import { SurveyResultMongoRepository } from './survey-result-mongo-repository'

let surveysCollection: Collection
let surveyResultsCollection: Collection
let accountCollection: Collection

const makeSurvey = (): AddSurveyParams => {
  return {
    question: 'question',
    answers: [{
      image: 'image',
      answer: 'answer'
    }, {
      image: 'image',
      answer: 'answer'
    }],
    date: new Date()
  }
}

const makeAccount = (): AddAccountParams => {
  return {
    email: 'email@mail.com',
    name: 'name',
    password: 'password'
  }
}

const makeSut = (): SurveyResultMongoRepository => {
  const sut = new SurveyResultMongoRepository()
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
    surveyResultsCollection = await MongoHelper.getCollection('surveyResults')
    await surveyResultsCollection.deleteMany({})
    accountCollection = await MongoHelper.getCollection('accounts')
    await accountCollection.deleteMany({})
  })

  describe('save', () => {
    test('Should add new answer if user has not answered the survey yet', async () => {
      const sut = makeSut()
      const surveyInserted = await surveysCollection.insertOne(makeSurvey())
      const surveyId = surveyInserted.insertedId.toString()
      const accountInserted = await accountCollection.insertOne(makeAccount())
      const accountId = accountInserted.insertedId.toString()

      const surveyReturn = await sut.save({ surveyId, accountId, answer: 'answer', date: new Date() })
      expect(surveyReturn).toBeTruthy()
      expect(surveyReturn).toHaveProperty('id')
      expect(surveyReturn.answer).toBe('answer')
      const countSurveyReuslts = await surveyResultsCollection.countDocuments()
      expect(countSurveyReuslts).toBe(1)
    })

    test('Should update answer if user has already answered the survey', async () => {
      const sut = makeSut()
      const surveyInserted = await surveysCollection.insertOne(makeSurvey())
      const surveyId = surveyInserted.insertedId.toString()
      const accountInserted = await accountCollection.insertOne(makeAccount())
      const accountId = accountInserted.insertedId.toString()
      const surveyRsultInserted = await surveyResultsCollection.insertOne({ surveyId, accountId, answer: 'answer', date: new Date() })
      const surveyRsultId = surveyRsultInserted.insertedId.toString()

      const surveyReturn = await sut.save({ surveyId, accountId, answer: 'newAnswer', date: new Date() })
      expect(surveyReturn).toBeTruthy()
      expect(surveyReturn.id).toBe(surveyRsultId)
      expect(surveyReturn.answer).toBe('newAnswer')
      const countSurveyReuslts = await surveyResultsCollection.countDocuments()
      expect(countSurveyReuslts).toBe(1)
    })

    test('Should throw if survey does not exist', async () => {
      const sut = makeSut()
      const accountInserted = await accountCollection.insertOne(makeAccount())
      const accountId = accountInserted.insertedId.toString()

      const surveyReturn = sut.save({ surveyId: 'surveyId', accountId, answer: 'answer', date: new Date() })
      await expect(surveyReturn).rejects.toThrow()
    })

    test('Should throw if account does not exist', async () => {
      const sut = makeSut()

      const surveyReturn = sut.save({ surveyId: 'surveyId', accountId: 'accountId', answer: 'answer', date: new Date() })
      await expect(surveyReturn).rejects.toThrow()
    })
  })
})
