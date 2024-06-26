import { CompareFieldValidation, EmailValidation, RequiredFieldValidation, ValidationComposite } from '@/validation/validators'
import { type EmailValidator } from '@/validation/protocols/email-validator'
import { type Validation } from '@/presentation/protocols/validation'
import { makeSingupValidation } from './singup-validation-factory'

jest.mock('../../../../validation/validators/validation-composite')

const mockEmailValidator = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid (email: string): boolean {
      return true
    }
  }
  return new EmailValidatorStub()
}

describe('SingupValidation factory', () => {
  test('Should call ValidationComposite with all validations', () => {
    makeSingupValidation()
    const validations: Validation[] = []
    for (const field of ['name', 'email', 'password', 'passwordConfirmation']) {
      validations.push(new RequiredFieldValidation(field))
    }
    validations.push(new CompareFieldValidation('password', 'passwordConfirmation'))
    validations.push(new EmailValidation('email', mockEmailValidator()))
    expect(ValidationComposite).toHaveBeenCalledWith(validations)
  })
})
