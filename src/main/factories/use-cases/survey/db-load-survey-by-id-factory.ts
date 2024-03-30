import { DbLoadSurveyById } from '@/data/usecases/survey/load-surveys-by-id/db-load-survey-by-id'
import { type LoadSurveyById } from '@/domain/usecases/survey/load-surveys-by-id'
import { SurveyMongoRepository } from '@/infra/db/mongodb/survey-repository/survey-mongo-repository'

export const makeDbLoadSurveyById = (): LoadSurveyById => {
  return new DbLoadSurveyById(new SurveyMongoRepository())
}
