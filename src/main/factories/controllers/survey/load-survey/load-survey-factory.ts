import { makeLogControllerDecorator } from '@/main/factories/decorators/log-controller'
import { makeDbLoadSurveys } from '@/main/factories/use-cases/survey/db-load-surveys-factory'
import { LoadSurveysController } from '@/presentation/controllers/survey/load-surveys/load-survey-controler'
import { type Controller } from '@/presentation/protocols'

export const makeLoadSurveysController = (): Controller => {
  const addSurveyController = new LoadSurveysController(makeDbLoadSurveys())
  return makeLogControllerDecorator(addSurveyController)
}
