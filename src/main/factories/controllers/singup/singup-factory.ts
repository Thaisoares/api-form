import { SignUpController } from '../../../../presentation/controllers/auth/signup/signup-controller'
import { type Controller } from '../../../../presentation/protocols'
import { makeDbAddAccount } from '../../use-cases/db-add-account-factory'
import { makeDbAuthentication } from '../../use-cases/db-authentication-factory'
import { makeLogControllerDecorator } from '../decorators/log-controller'
import { makeSingupValidation } from './singup-validation-factory'

export const makeSingupController = (): Controller => {
  const signUpController = new SignUpController(makeDbAddAccount(), makeSingupValidation(), makeDbAuthentication())
  return makeLogControllerDecorator(signUpController)
}
