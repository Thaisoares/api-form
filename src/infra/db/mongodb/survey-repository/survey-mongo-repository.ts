import { type AddSurveyModel, type AddSurveyRepository } from '../../../../data/usecases/add-survey/db-add-survey-protocols'
import { InsertError } from '../errors'
import { MongoHelper } from '../helpers/mogo-helper'

export class SurveyMongoRepository implements AddSurveyRepository {
  async add (surveyData: AddSurveyModel): Promise<null> {
    const surveysCollection = await MongoHelper.getCollection('surveys')
    const result = await surveysCollection.insertOne(surveyData)
    if (result.acknowledged) {
      return null
    }
    throw new InsertError('surveys')
  }
}
