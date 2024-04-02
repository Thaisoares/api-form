import Mockdate from 'mockdate'
import { forbidden, type HttpRequest, type LoadSurveyById, type SurveyResultModel, InvalidParamError, serverError, ok, type SurveyModel } from './load-survey-result-controler-protocols'
import { type LoadSurveyResult } from '@/domain/usecases/survey-result/load-survey-result'
import { LoadSurveyResultController } from './load-survey-result-controler'

const mockHttpRequest = (): HttpRequest => {
  return {
    params: {
      surveyId: 'surveyId'
    },
    accountId: 'accountId'
  }
}

const mockSurvey = (): SurveyModel => {
  return {
    id: 'id',
    question: 'question',
    answers: [{
      image: 'image',
      answer: 'answer'
    }, {
      image: 'image',
      answer: 'otherAnswer'
    }],
    date: new Date()
  }
}

const mockSurveyResult = (): SurveyResultModel => {
  return {
    surveyId: 'surveyId',
    question: 'question',
    answers: [{
      answer: 'answer',
      count: 3,
      percent: 60
    }, {
      answer: 'answer2',
      count: 2,
      percent: 40
    }],
    date: new Date()
  }
}

const mockLoadSurveyById = (): LoadSurveyById => {
  class LoadSurveyByIdStub implements LoadSurveyById {
    async loadById (id: string): Promise<SurveyModel | null> {
      return await Promise.resolve(mockSurvey())
    }
  }
  return new LoadSurveyByIdStub()
}

const mockLoadSurveyResult = (): LoadSurveyResult => {
  class LoadSurveyResultStub implements LoadSurveyResult {
    async load (surveyId: string): Promise<SurveyResultModel> {
      return await Promise.resolve(mockSurveyResult())
    }
  }
  return new LoadSurveyResultStub()
}

type sutTypes = {
  sut: LoadSurveyResultController
  loadSurveyByIdStub: LoadSurveyById
  loadSurveyResultStub: LoadSurveyResult
}

const makeSut = (): sutTypes => {
  const loadSurveyByIdStub = mockLoadSurveyById()
  const loadSurveyResultStub = mockLoadSurveyResult()
  const sut = new LoadSurveyResultController(loadSurveyByIdStub, loadSurveyResultStub)
  return {
    sut,
    loadSurveyByIdStub,
    loadSurveyResultStub
  }
}

describe('Save Survey Controller', () => {
  beforeAll(() => {
    Mockdate.set(new Date())
  })

  afterAll(() => {
    Mockdate.reset()
  })

  test('Should call LoadSurveyById with correct values', async () => {
    const { sut, loadSurveyByIdStub } = makeSut()
    const loadByIdSpy = jest.spyOn(loadSurveyByIdStub, 'loadById')
    const httpRequest = mockHttpRequest()
    await sut.handle(httpRequest)
    expect(loadByIdSpy).toHaveBeenCalledWith(httpRequest.params.surveyId)
  })

  test('Should return 403 if LoadSurveyById returns null', async () => {
    const { sut, loadSurveyByIdStub } = makeSut()
    jest.spyOn(loadSurveyByIdStub, 'loadById').mockResolvedValueOnce(null)
    const httpRequest = mockHttpRequest()

    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toEqual(forbidden(new InvalidParamError('surveyId')))
  })

  test('Should return 500 if LoadSurveyById throws', async () => {
    const { sut, loadSurveyByIdStub } = makeSut()
    jest.spyOn(loadSurveyByIdStub, 'loadById').mockImplementationOnce(() => { throw new Error() })

    const httpResponse = await sut.handle(mockHttpRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should call loadSurveyResult with correct value', async () => {
    const { sut, loadSurveyResultStub } = makeSut()
    const loadSpy = jest.spyOn(loadSurveyResultStub, 'load')
    const httpRequest = mockHttpRequest()

    await sut.handle(httpRequest)
    expect(loadSpy).toHaveBeenCalledWith(httpRequest.params.surveyId)
  })

  test('Should return 500 if SaveSurveyResult throws', async () => {
    const { sut, loadSurveyResultStub } = makeSut()
    jest.spyOn(loadSurveyResultStub, 'load').mockImplementationOnce(() => { throw new Error() })

    const httpResponse = await sut.handle(mockHttpRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should return 200 on success', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(mockHttpRequest())
    expect(httpResponse).toEqual(ok(mockSurveyResult()))
  })
})
