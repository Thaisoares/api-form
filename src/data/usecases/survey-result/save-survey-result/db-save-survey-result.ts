import { ServerError } from '@/presentation/errors'
import { type LoadSurveyResultRepository } from '../load-survey-result/db-load-survey-result-protocols'
import { type SaveSurveyResult, type SaveSurveyResultParams, type SaveSurveyResultRepository, type SurveyResultModel } from './db-save-survey-result-protocols'

export class DbSaveSurveyResult implements SaveSurveyResult {
  constructor (
    private readonly saveSurveyResultRepository: SaveSurveyResultRepository,
    private readonly loadSurveyResultRepository: LoadSurveyResultRepository
  ) {}

  async save (data: SaveSurveyResultParams): Promise<SurveyResultModel> {
    await this.saveSurveyResultRepository.save(data)
    const surveyResults = await this.loadSurveyResultRepository.loadBySurveyId(data.surveyId)

    if (surveyResults) return surveyResults
    throw new ServerError('No survey infos on database')
  }
}
