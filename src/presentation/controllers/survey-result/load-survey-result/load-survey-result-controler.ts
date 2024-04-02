import { type LoadSurveyResult } from '@/domain/usecases/survey-result/load-survey-result'
import { type Controller, type LoadSurveyById, type HttpRequest, type HttpResponse, serverError, forbidden, InvalidParamError, unauthorized, ok } from './load-survey-result-controler-protocols'

export class LoadSurveyResultController implements Controller {
  constructor (
    private readonly loadSurveyById: LoadSurveyById,
    private readonly loadSurveyResult: LoadSurveyResult
  ) {}

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { surveyId } = httpRequest.params
      const { accountId } = httpRequest

      const survey = await this.loadSurveyById.loadById(surveyId)
      if (!survey) {
        return forbidden(new InvalidParamError('surveyId'))
      }
      if (!accountId) {
        return unauthorized()
      }

      const surveyResult = await this.loadSurveyResult.load(surveyId)

      return ok(surveyResult)
    } catch (error) {
      return serverError(error)
    }
  }
}
