/* eslint-disable @typescript-eslint/no-misused-promises */
import { type Router } from 'express'
import { adaptRoute } from '../adapter/express-route-adapter'
import { makeSingupController } from '../factories/controllers/singup/singup-factory'
import { makeLoginController } from '../factories/controllers/login/login-factory'

export default (router: Router): void => {
  router.post('/singup', adaptRoute(makeSingupController()))
  router.post('/login', adaptRoute(makeLoginController()))
}
