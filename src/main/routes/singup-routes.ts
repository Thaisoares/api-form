import { type Router } from 'express'
import { adaptRoute } from '../adapter/express-route-adapter'
import { makeSingupController } from '../factories/singup'

export default (router: Router): void => {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  router.post('/singup', adaptRoute(makeSingupController()))
}
