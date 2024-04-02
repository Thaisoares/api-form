import { DbLoadSurveyResult } from '@/data/usecases/survey-result/load-survey-result/db-load-survey-result'
import { type LoadSurveyResult } from '@/domain/usecases/survey-result/load-survey-result'
import { SurveyMongoRepository } from '@/infra/db/mongodb/survey-repository/survey-mongo-repository'
import { SurveyResultMongoRepository } from '@/infra/db/mongodb/survey-result-repository/survey-result-mongo-repository'

export const makeDbLoadSurveyResults = (): LoadSurveyResult => {
  return new DbLoadSurveyResult(new SurveyResultMongoRepository(), new SurveyMongoRepository())
}
