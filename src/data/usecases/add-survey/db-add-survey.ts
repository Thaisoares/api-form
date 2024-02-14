import { AddSurvey, AddSurveyModel, AddSurveyRepository } from './db-add-survey-protocols'

export class DbAddSurvey implements AddSurvey {
  constructor (
    private readonly addSurveyRepository: AddSurveyRepository,
  ) { }

  async add (data: AddSurveyModel): Promise<null> {
    await this.addSurveyRepository.add(data)
    return null
  }
}
