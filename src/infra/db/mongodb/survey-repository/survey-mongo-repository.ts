import { type AddAccountRepository } from '../../../../data/protocols/db/account/add-account-repository'
import { type LoadAccountByEmailRepository } from '../../../../data/protocols/db/account/load-account-by-email-repository'
import { AddSurveyModel, AddSurveyRepository } from '../../../../data/usecases/add-survey/db-add-survey-protocols'
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
