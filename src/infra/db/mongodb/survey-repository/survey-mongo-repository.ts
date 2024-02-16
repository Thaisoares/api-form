import { type AddSurveyModel, type AddSurveyRepository } from '../../../../data/usecases/add-survey/db-add-survey-protocols'
import { type SurveyModel, type LoadSurveysRepository } from '../../../../data/usecases/load-surveys/db-load-survey-protocols'
import { InsertError } from '../errors'
import { MongoHelper } from '../helpers/mogo-helper'

export class SurveyMongoRepository implements AddSurveyRepository, LoadSurveysRepository {
  async add (surveyData: AddSurveyModel): Promise<null> {
    const surveysCollection = await MongoHelper.getCollection('surveys')
    const result = await surveysCollection.insertOne(surveyData)
    if (result.acknowledged) {
      return null
    }
    throw new InsertError('surveys')
  }

  async loadAll (): Promise<SurveyModel[]> {
    const surveysCollection = await MongoHelper.getCollection('surveys')
    const surveys = await surveysCollection.find({}).toArray()
    return surveys.map(survey => MongoHelper.map(survey))
  }
}
