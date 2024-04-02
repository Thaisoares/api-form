import { makeLogControllerDecorator } from '@/main/factories/decorators/log-controller'
import { makeDbLoadSurveyResults } from '@/main/factories/use-cases/survey-result/db-load-survey-result-factory'
import { makeDbLoadSurveyById } from '@/main/factories/use-cases/survey/db-load-survey-by-id-factory'
import { LoadSurveyResultController } from '@/presentation/controllers/survey-result/load-survey-result/load-survey-result-controler'
import { type Controller } from '@/presentation/protocols'

export const makeLoadSurveyResultController = (): Controller => {
  const saveSurveyResultController = new LoadSurveyResultController(makeDbLoadSurveyById(), makeDbLoadSurveyResults())
  return makeLogControllerDecorator(saveSurveyResultController)
}
