import { makeLogControllerDecorator } from '@/main/factories/decorators/log-controller'
import { makeDbSaveSurveyResults } from '@/main/factories/use-cases/survey-result/db-save-survey-result-factory'
import { makeDbLoadSurveyById } from '@/main/factories/use-cases/survey/db-load-survey-by-id-factory'
import { SaveSurveyResultController } from '@/presentation/controllers/survey-result/save-survey/save-survey-controler'
import { type Controller } from '@/presentation/protocols'

export const makeSaveSurveyResultController = (): Controller => {
  const saveSurveyResultController = new SaveSurveyResultController(makeDbLoadSurveyById(), makeDbSaveSurveyResults())
  return makeLogControllerDecorator(saveSurveyResultController)
}
