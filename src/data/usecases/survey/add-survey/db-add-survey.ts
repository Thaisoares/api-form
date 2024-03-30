import { type AddSurvey, type AddSurveyParams, type AddSurveyRepository } from './db-add-survey-protocols'

export class DbAddSurvey implements AddSurvey {
  constructor (
    private readonly addSurveyRepository: AddSurveyRepository
  ) { }

  async add (data: AddSurveyParams): Promise<null> {
    await this.addSurveyRepository.add(data)
    return null
  }
}
