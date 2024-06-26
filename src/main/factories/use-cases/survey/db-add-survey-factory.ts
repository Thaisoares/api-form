import { DbAddSurvey } from '@/data/usecases/survey/add-survey/db-add-survey'
import { type AddSurvey } from '@/domain/usecases/survey/add-survey'
import { SurveyMongoRepository } from '@/infra/db/mongodb/survey-repository/survey-mongo-repository'

export const makeDbAddSurvey = (): AddSurvey => {
  return new DbAddSurvey(new SurveyMongoRepository())
}
