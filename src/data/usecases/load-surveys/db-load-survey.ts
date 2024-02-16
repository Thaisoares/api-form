import { type LoadSurveysRepository, type SurveyModel, type LoadSurveys } from './db-load-survey-protocols'

export class DbLoadSurvey implements LoadSurveys {
  constructor (
    private readonly loadSurveysRepository: LoadSurveysRepository
  ) { }

  async load (): Promise<SurveyModel[]> {
    return await this.loadSurveysRepository.loadAll()
  }
}
