import { makeLoginValidation } from './login-validation-factory'
import { makeDbAuthentication } from '../../use-cases/db-authentication-factory'
import { LoginController } from '../../../../presentation/controllers/auth/login/login-controller'
import { Controller } from '../../../../presentation/protocols'
import { makeLogControllerDecorator } from '../../decorators/log-controller'

export const makeLoginController = (): Controller => {
  const loginController = new LoginController(makeDbAuthentication(), makeLoginValidation())
  return makeLogControllerDecorator(loginController)
}
