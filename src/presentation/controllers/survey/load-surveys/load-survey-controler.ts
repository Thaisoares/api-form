import { noContent, ok, serverError } from '../../../helpers/http/http-helper'
import { type LoadSurveys, type Controller, type HttpRequest, type HttpResponse } from './load-survey-controler-protocols'

export class LoadSurveysController implements Controller {
  constructor (
    private readonly loadSurveys: LoadSurveys
  ) {}

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const surveys = await this.loadSurveys.load()

      return surveys.length ? ok({ surveys }) : noContent()
    } catch (error) {
      return serverError(error)
    }
  }
}
