/* eslint-disable @typescript-eslint/no-misused-promises */
import { type Router } from 'express'
import { adaptRoute } from '@/main/adapter/express-route-adapter'
import { adaptMiddleware } from '@/main/adapter/express-middleware-adapter'
import { makeAuthMiddleware } from '@/main/factories/middleware/auth-middleware-factory'
import { makeSaveSurveyResultController } from '@/main/factories/controllers/survey-result/save-survey-result/save-survey-result-factory'
import { makeLoadSurveyResultController } from '../factories/controllers/survey-result/load-survey-result/load-survey-result-factory'

export default (router: Router): void => {
  const auth = adaptMiddleware(makeAuthMiddleware())
  router.put('/surveys/:surveyId/results', auth, adaptRoute(makeSaveSurveyResultController()))
  router.get('/surveys/:surveyId/results', auth, adaptRoute(makeLoadSurveyResultController()))
}
