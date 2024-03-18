import { ValidationComposite } from './validation-composite'
import { InvalidParamError, MissingParamError } from '@/presentation/errors'
import { type Validation } from '@/presentation/protocols'

const makeValidationStub = (): Validation => {
  class ValidationStub implements Validation {
    validate (input: any): Error | null {
      return null
    }
  }
  return new ValidationStub()
}

type sutTypes = {
  sut: ValidationComposite
  validationStubs: Validation[]
}

const makeSut = (): sutTypes => {
  const validationStubs = [makeValidationStub(), makeValidationStub()]
  const sut = new ValidationComposite(validationStubs)
  return {
    sut,
    validationStubs
  }
}

describe('Validation Composite', () => {
  test('Should return same error if any validation fails', () => {
    const { sut, validationStubs } = makeSut()
    const errorToThrow = new MissingParamError('error')
    jest.spyOn(validationStubs[0], 'validate').mockReturnValueOnce(errorToThrow)
    const error = sut.validate({ field: 'field' })
    expect(error).toEqual(errorToThrow)
  })

  test('Should return same error of the first validation to fails', () => {
    const { sut, validationStubs } = makeSut()
    const errorToThrow = new MissingParamError('error')
    jest.spyOn(validationStubs[0], 'validate').mockReturnValueOnce(errorToThrow)
    jest.spyOn(validationStubs[0], 'validate').mockReturnValueOnce(new InvalidParamError('error'))
    const error = sut.validate({ field: 'field' })
    expect(error).toEqual(errorToThrow)
  })

  test('Should return null if all validation pass', () => {
    const { sut } = makeSut()
    const error = sut.validate({ field: 'field' })
    expect(error).toEqual(null)
  })
})
