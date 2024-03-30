import { type SaveSurveyResultRepository } from '@/data/protocols/db/survey-result/save-survey-result-repository'
import { type SurveyResultModel } from '@/domain/models/survey-result'
import { type SaveSurveyResultParams } from '@/domain/usecases/survey-result/save-survey-result'
import { MongoHelper } from '../helpers/mogo-helper'
import { ObjectId } from 'mongodb'
import { InvalidParamError } from '@/presentation/errors'

export class SurveyResultMongoRepository implements SaveSurveyResultRepository {
  async save (data: SaveSurveyResultParams): Promise<SurveyResultModel> {
    const surveysCollection = await MongoHelper.getCollection('surveys')
    const surveyObjectId = new ObjectId(data.surveyId)
    const survey = await surveysCollection.findOne({ _id: surveyObjectId })

    const accountsCollection = await MongoHelper.getCollection('accounts')
    const accountObjectId = new ObjectId(data.accountId)
    const account = await accountsCollection.findOne({ _id: accountObjectId })

    if (survey && account) {
      const surveyResultCollection = await MongoHelper.getCollection('surveyResults')
      const res = await surveyResultCollection.findOneAndUpdate({
        surveyId: data.surveyId,
        accountId: data.accountId
      }, {
        $set: {
          answer: data.answer,
          date: data.date
        }
      }, {
        upsert: true,
        returnDocument: 'after'
      })

      return res && MongoHelper.map(res)
    }
    if (account) {
      throw new InvalidParamError('surveyId')
    }
    throw new InvalidParamError('accountId')
  }
}
