import { type SurveyModel, type LoadSurveyById, type LoadSurveyByIdRepository } from './db-load-survey-by-id-protocols'

export class DbLoadSurveyById implements LoadSurveyById {
  constructor (
    private readonly loadSurveyByIdRepository: LoadSurveyByIdRepository
  ) { }

  async loadById (id: string): Promise<SurveyModel | null> {
    return await this.loadSurveyByIdRepository.loadById(id)
  }
}
