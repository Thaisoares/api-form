import { type AddSurvey, type AddSurveyParams, type Validation } from './add-survey-controler-protocols'
import { AddSurveyController } from './add-survey-controler'
import { MissingParamError } from '@/presentation/errors'
import { badRequest, noContent, serverError } from '@/presentation/helpers/http/http-helper'
import Mockdate from 'mockdate'

const mockHttpRequest = (): any => {
  return {
    body: {
      question: 'question',
      answers: [{
        image: 'image',
        answer: 'answer'
      }]
    }
  }
}

const mockValidation = (): Validation => {
  class ValidationStub implements Validation {
    validate (input: any): Error | null {
      return null
    }
  }
  return new ValidationStub()
}

const mockAddSurvey = (): AddSurvey => {
  class AddSurveyStub implements AddSurvey {
    async add (data: AddSurveyParams): Promise<null> {
      return null
    }
  }
  return new AddSurveyStub()
}

type sutTypes = {
  sut: AddSurveyController
  validationStub: Validation
  addSurveyStub: AddSurvey
}

const makeSut = (): sutTypes => {
  const validationStub = mockValidation()
  const addSurveyStub = mockAddSurvey()
  const sut = new AddSurveyController(validationStub, addSurveyStub)
  return {
    sut,
    validationStub,
    addSurveyStub
  }
}

describe('Add Survey Controller', () => {
  beforeAll(() => {
    Mockdate.set(new Date())
  })

  afterAll(() => {
    Mockdate.reset()
  })

  test('Should call Validation with correct values', async () => {
    const { sut, validationStub } = makeSut()
    const validationSpy = jest.spyOn(validationStub, 'validate')
    const httpRequest = mockHttpRequest()
    await sut.handle(httpRequest)
    expect(validationSpy).toHaveBeenCalledWith(httpRequest.body)
  })

  test('Should return 400 if Validation returns an error', async () => {
    const { sut, validationStub } = makeSut()
    const error = new MissingParamError('filed')
    jest.spyOn(validationStub, 'validate').mockReturnValueOnce(error)
    const httpRequest = mockHttpRequest()

    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toEqual(badRequest(error))
  })

  test('Should call AddSurvey with correct values', async () => {
    const { sut, addSurveyStub } = makeSut()
    const addSpy = jest.spyOn(addSurveyStub, 'add')
    const httpRequest = mockHttpRequest()
    await sut.handle(httpRequest)
    expect(addSpy).toHaveBeenCalledWith({ ...httpRequest.body, date: new Date() })
  })

  test('Should return 500 if AddSurvey throws', async () => {
    const { sut, addSurveyStub } = makeSut()
    jest.spyOn(addSurveyStub, 'add').mockImplementationOnce(() => { throw new Error() })
    const httpRequest = mockHttpRequest()

    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should return 204 on success', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(mockHttpRequest())
    expect(httpResponse).toEqual(noContent())
  })
})
