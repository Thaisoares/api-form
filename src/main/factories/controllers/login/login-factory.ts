import { makeLoginValidation } from './login-validation-factory'
import { makeDbAuthentication } from '@/main/factories/use-cases/account/db-authentication-factory'
import { makeLogControllerDecorator } from '@/main/factories/decorators/log-controller'
import { LoginController } from '@/presentation/controllers/auth/login/login-controller'
import { type Controller } from '@/presentation/protocols'

export const makeLoginController = (): Controller => {
  const loginController = new LoginController(makeDbAuthentication(), makeLoginValidation())
  return makeLogControllerDecorator(loginController)
}
