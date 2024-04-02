import { ServerError } from '@/presentation/errors'
import { type SurveyResultModel, type LoadSurveyResult, type LoadSurveyResultRepository, type LoadSurveyByIdRepository } from './db-load-survey-result-protocols'

export class DbLoadSurveyResult implements LoadSurveyResult {
  constructor (
    private readonly loadSurveyResultRepository: LoadSurveyResultRepository,
    private readonly loadSurveyByIdRepository: LoadSurveyByIdRepository
  ) {}

  async load (surveyId: string): Promise<SurveyResultModel> {
    const surveyInfo = await this.loadSurveyResultRepository.loadBySurveyId(surveyId)
    if (surveyInfo) return surveyInfo
    const survey = await this.loadSurveyByIdRepository.loadById(surveyId)
    if (survey) {
      const infos: SurveyResultModel = {
        question: survey.question,
        surveyId: survey.id,
        date: survey.date,
        answers: survey.answers.map(answer => Object.assign({}, answer, {
          count: 0,
          percent: 0
        }))
      }
      return infos
    }
    throw new ServerError('No survey infos')
  }
}
