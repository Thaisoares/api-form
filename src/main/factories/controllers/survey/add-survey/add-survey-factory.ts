import { makeAddSurveyValidation } from './add-survey-validation-factory'
import { type Controller } from '../../../../../presentation/protocols'
import { makeLogControllerDecorator } from '../../../decorators/log-controller'
import { AddSurveyController } from '../../../../../presentation/controllers/survey/add-survey/add-survey-controler'
import { makeDbAddSurvey } from '../../../use-cases/survey/db-add-survey-factory'

export const makeAddSurveyController = (): Controller => {
  const addSurveyController = new AddSurveyController(makeAddSurveyValidation(), makeDbAddSurvey())
  return makeLogControllerDecorator(addSurveyController)
}
