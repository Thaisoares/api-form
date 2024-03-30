import { DbSaveSurveyResult } from '@/data/usecases/survey-result/save-survey-result/db-save-survey-result'
import { type SaveSurveyResult } from '@/domain/usecases/survey-result/save-survey-result'
import { SurveyResultMongoRepository } from '@/infra/db/mongodb/survey-result-repository/survey-result-mongo-repository'

export const makeDbSaveSurveyResults = (): SaveSurveyResult => {
  return new DbSaveSurveyResult(new SurveyResultMongoRepository())
}
