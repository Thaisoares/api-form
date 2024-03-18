/* eslint-disable @typescript-eslint/no-misused-promises */
import { type Router } from 'express'
import { adaptRoute } from '@/main/adapter/express-route-adapter'
import { makeSingupController } from '@/main/factories/controllers/singup/singup-factory'
import { makeLoginController } from '@/main/factories/controllers/login/login-factory'

export default (router: Router): void => {
  router.post('/singup', adaptRoute(makeSingupController()))
  router.post('/login', adaptRoute(makeLoginController()))
}
