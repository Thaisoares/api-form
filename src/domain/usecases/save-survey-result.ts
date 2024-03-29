import { type SurveyResultModel } from '../models/survey-result'

export type SaveSurveyResultModel = Omit<SurveyResultModel, 'id'>

export interface AddSurvey {
  save: (data: SaveSurveyResultModel) => Promise<SurveyResultModel>
}
