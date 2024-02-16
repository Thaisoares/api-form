import { badRequest, noContent, serverError } from '../../../helpers/http/http-helper'
import { type AddSurvey, type Controller, type HttpRequest, type HttpResponse, type Validation } from './add-survey-controler-protocols'

export class AddSurveyController implements Controller {
  constructor (
    private readonly validation: Validation,
    private readonly addSurvey: AddSurvey
  ) {}

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const errorValidation = this.validation.validate(httpRequest.body)
      if (errorValidation) {
        return badRequest(errorValidation)
      }

      const { question, answers } = httpRequest.body
      await this.addSurvey.add({ question, answers, date: new Date() })

      return noContent()
    } catch (error) {
      return serverError(error)
    }
  }
}
