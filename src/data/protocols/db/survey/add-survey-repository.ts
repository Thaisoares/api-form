import { type AddSurveyModel } from '@/data/usecases/survey/add-survey/db-add-survey-protocols'

export interface AddSurveyRepository {
  add: (data: AddSurveyModel) => Promise<null>
}
