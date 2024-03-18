/* eslint-disable @typescript-eslint/no-misused-promises */
import { type Router } from 'express'
import { adaptRoute } from '@/main/adapter/express-route-adapter'
import { adaptMiddleware } from '@/main/adapter/express-middleware-adapter'
import { makeAddSurveyController } from '@/main/factories/controllers/survey/add-survey/add-survey-factory'
import { makeAuthMiddleware } from '@/main/factories/middleware/auth-middleware-factory'
import { makeLoadSurveysController } from '@/main/factories/controllers/survey/load-survey/load-survey-factory'

export default (router: Router): void => {
  const adminAuth = adaptMiddleware(makeAuthMiddleware('admin'))
  const auth = adaptMiddleware(makeAuthMiddleware())
  router.post('/surveys', adminAuth, adaptRoute(makeAddSurveyController()))
  router.get('/surveys', auth, adaptRoute(makeLoadSurveysController()))
}
