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
      answer: 'otherAnswer'
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
      const survey = makeSurvey()
      const answer0 = survey.answers[0].answer
      const sut = makeSut()
      const surveyInserted = await surveysCollection.insertOne(makeSurvey())
      const surveyId = surveyInserted.insertedId
      const accountInserted = await accountCollection.insertOne(makeAccount())
      const accountId = accountInserted.insertedId

      await sut.save({ surveyId: surveyId.toString(), accountId: accountId.toString(), answer: answer0, date: new Date() })
      const surveyReturn = await surveyResultsCollection.find({
        surveyId, accountId
      }).toArray()
      const surveyResults = surveyReturn[0]
      expect(surveyResults).toBeTruthy()
      expect(surveyResults.answer).toBe(answer0)
      const countSurveyReuslts = await surveyResultsCollection.countDocuments()
      expect(countSurveyReuslts).toBe(1)
    })

    test('Should update answer if user has already answered the survey', async () => {
      const survey = makeSurvey()
      const answer0 = survey.answers[0].answer
      const answer1 = survey.answers[1].answer
      const sut = makeSut()
      const surveyInserted = await surveysCollection.insertOne(survey)
      const surveyId = surveyInserted.insertedId
      const accountInserted = await accountCollection.insertOne(makeAccount())
      const accountId = accountInserted.insertedId
      await surveyResultsCollection.insertOne({ surveyId, accountId, answer: answer0, date: new Date() })

      await sut.save({ surveyId: surveyId.toString(), accountId: accountId.toString(), answer: answer1, date: new Date() })
      const surveyResult = await surveyResultsCollection.find({
        surveyId, accountId
      }).toArray()
      expect(surveyResult).toBeTruthy()
      expect(surveyResult[0].answer).toBe(answer1)
      expect(surveyResult.length).toBe(1)
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

  describe('loadSurveyById', () => {
    test('Should return correct infos of survey', async () => {
      const survey = makeSurvey()
      const answer0 = survey.answers[0].answer
      const answer1 = survey.answers[1].answer
      const sut = makeSut()
      const surveyInserted = await surveysCollection.insertOne(survey)
      const surveyId = surveyInserted.insertedId
      const accountInserted = await accountCollection.insertOne(makeAccount())
      const accountId = accountInserted.insertedId
      await surveyResultsCollection.insertOne({ surveyId, accountId, answer: answer0, date: new Date() })
      await surveyResultsCollection.insertOne({ surveyId, accountId, answer: answer0, date: new Date() })
      await surveyResultsCollection.insertOne({ surveyId, accountId, answer: answer1, date: new Date() })

      const surveyReturn = await sut.loadBySurveyId(surveyId.toString())
      expect(surveyReturn).toBeTruthy()
      expect(surveyReturn?.surveyId).toBe(surveyId.toString())
      expect(surveyReturn?.question).toBe(survey.question)
      expect(surveyReturn?.answers[1].count).toBe(1)
      expect(surveyReturn?.answers[1].percent).toBeCloseTo(33.333)
      expect(surveyReturn?.answers[0].count).toBe(2)
      expect(surveyReturn?.answers[0].percent).toBeCloseTo(66.666)
    })

    test('Should return null if survey does not exist', async () => {
      const sut = makeSut()

      const surveyReturn = await sut.loadBySurveyId('66084bf1d949ce7ebe5fbff9')
      expect(surveyReturn).toBeNull()
    })
  })
})
