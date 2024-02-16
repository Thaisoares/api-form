import { DbAddSurvey } from '../../../../data/usecases/add-survey/db-add-survey'
import { type AddSurvey } from '../../../../domain/usecases/add-survey'
import { SurveyMongoRepository } from '../../../../infra/db/mongodb/survey-repository/survey-mongo-repository'

export const makeDbAddSurvey = (): AddSurvey => {
  return new DbAddSurvey(new SurveyMongoRepository())
}
