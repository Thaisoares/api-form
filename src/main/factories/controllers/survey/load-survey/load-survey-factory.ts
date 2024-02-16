import { LoadSurveysController } from '../../../../../presentation/controllers/survey/load-surveys/load-survey-controler'
import { type Controller } from '../../../../../presentation/protocols'
import { makeLogControllerDecorator } from '../../../decorators/log-controller'
import { makeDbLoadSurveys } from '../../../use-cases/survey/db-load-surveys-factory'

export const makeLoadSurveysController = (): Controller => {
  const addSurveyController = new LoadSurveysController(makeDbLoadSurveys())
  return makeLogControllerDecorator(addSurveyController)
}
