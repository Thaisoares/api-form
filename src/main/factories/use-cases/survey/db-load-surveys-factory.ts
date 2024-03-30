import { DbLoadSurvey } from '@/data/usecases/survey/load-surveys/db-load-survey'
import { type LoadSurveys } from '@/domain/usecases/survey/load-surveys'
import { SurveyMongoRepository } from '@/infra/db/mongodb/survey-repository/survey-mongo-repository'

export const makeDbLoadSurveys = (): LoadSurveys => {
  return new DbLoadSurvey(new SurveyMongoRepository())
}
