import { MissingParamError } from '../../errors'
import { RequiredFieldValidation } from './required-field-validation'

describe('RequiredField Validation', () => {
  test('Should throw MissingParamsError if validation fails', () => {
    const sut = new RequiredFieldValidation('field')
    const error = sut.validate({})
    expect(error).toEqual(new MissingParamError('field'))
  })

  test('Should return null if data provided is correct', () => {
    const sut = new RequiredFieldValidation('field')
    const error = sut.validate({ field: 'content-field' })
    expect(error).toBe(null)
  })
})
