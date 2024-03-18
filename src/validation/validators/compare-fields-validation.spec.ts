import { InvalidParamError } from '@/presentation/errors'
import { CompareFieldValidation } from './compare-fields-validation'

describe('CompareField Validation', () => {
  test('Should throw InvalidParamError if validation fails', () => {
    const sut = new CompareFieldValidation('field', 'otherField')
    const error = sut.validate({
      field: 'content',
      otherField: 'invalid-content'
    })
    expect(error).toEqual(new InvalidParamError('field'))
  })

  test('Should return null if data provided is correct', () => {
    const sut = new CompareFieldValidation('field', 'otherField')
    const error = sut.validate({
      field: 'content',
      otherField: 'content'
    })
    expect(error).toBe(null)
  })
})
