import { SignUpController } from '@/presentation/controllers/auth/signup/signup-controller'
import { type Controller } from '@/presentation/protocols'
import { makeDbAddAccount } from '@/main/factories/use-cases/account/db-add-account-factory'
import { makeDbAuthentication } from '@/main/factories/use-cases/account/db-authentication-factory'
import { makeLogControllerDecorator } from '@/main/factories/decorators/log-controller'
import { makeSingupValidation } from './singup-validation-factory'

export const makeSingupController = (): Controller => {
  const signUpController = new SignUpController(makeDbAddAccount(), makeSingupValidation(), makeDbAuthentication())
  return makeLogControllerDecorator(signUpController)
}
