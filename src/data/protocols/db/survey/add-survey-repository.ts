import { type AddSurveyParams } from '@/data/usecases/survey/add-survey/db-add-survey-protocols'

export interface AddSurveyRepository {
  add: (data: AddSurveyParams) => Promise<null>
}
