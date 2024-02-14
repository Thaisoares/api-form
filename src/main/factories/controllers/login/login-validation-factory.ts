import { EmailValidation, ValidationComposite, RequiredFieldValidation } from '../../../../validation/validators'
import { type Validation } from '../../../../presentation/protocols/validation'
import { EmailValidatorAdapter } from '../../../../utils/email-validator-adapter'

export const makeLoginValidation = (): ValidationComposite => {
  const validations: Validation[] = []
  for (const field of ['email', 'password']) {
    validations.push(new RequiredFieldValidation(field))
  }
  const emailValidator = new EmailValidatorAdapter()
  validations.push(new EmailValidation('email', emailValidator))
  return new ValidationComposite(validations)
}
