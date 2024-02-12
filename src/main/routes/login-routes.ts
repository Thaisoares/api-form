/* eslint-disable @typescript-eslint/no-misused-promises */
import { type Router } from 'express'
import { adaptRoute } from '../adapter/express-route-adapter'
import { makeSingupController } from '../factories/singup/singup-factory'
import { makeLoginController } from '../factories/login/login-factory'

export default (router: Router): void => {
  router.post('/singup', adaptRoute(makeSingupController()))
  router.post('/login', adaptRoute(makeLoginController()))
}
