import { type LoadSurveyByIdRepository } from '@/data/usecases/survey-result/save-survey-result/db-save-survey-result-protocols'
import { type AddSurveyParams, type AddSurveyRepository } from '../../../../data/usecases/survey/add-survey/db-add-survey-protocols'
import { type SurveyModel, type LoadSurveysRepository } from '../../../../data/usecases/survey/load-surveys/db-load-survey-protocols'
import { InsertError } from '../errors'
import { MongoHelper } from '../helpers/mogo-helper'
import { ObjectId } from 'mongodb'

export class SurveyMongoRepository implements AddSurveyRepository, LoadSurveysRepository, LoadSurveyByIdRepository {
  async add (surveyData: AddSurveyParams): Promise<null> {
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

  async loadById (id: string): Promise<SurveyModel | null> {
    const surveysCollection = await MongoHelper.getCollection('surveys')
    const objectId = new ObjectId(id)
    const survey = await surveysCollection.findOne({ _id: objectId })
    return survey && MongoHelper.map(survey)
  }
}
