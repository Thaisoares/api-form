import Mockdate from 'mockdate'
import { forbidden, type HttpRequest, type LoadSurveyById, type SaveSurveyResult, type SaveSurveyResultParams, type SurveyResultModel, InvalidParamError, serverError, ok, type SurveyModel } from './save-survey-controler-protocols'
import { SaveSurveyResultController } from './save-survey-controler'

const mockHttpRequest = (): HttpRequest => {
  return {
    body: {
      answer: 'answer'
    },
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
    id: 'id',
    surveyId: 'validId',
    accountId: 'validID',
    answer: 'validAnswer',
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

const mockSaveSurveyResult = (): SaveSurveyResult => {
  class SaveSurveyResultStub implements SaveSurveyResult {
    async save (data: SaveSurveyResultParams): Promise<SurveyResultModel> {
      return await Promise.resolve(mockSurveyResult())
    }
  }
  return new SaveSurveyResultStub()
}

type sutTypes = {
  sut: SaveSurveyResultController
  loadSurveyByIdStub: LoadSurveyById
  saveSurveyResultStub: SaveSurveyResult
}

const makeSut = (): sutTypes => {
  const loadSurveyByIdStub = mockLoadSurveyById()
  const saveSurveyResultStub = mockSaveSurveyResult()
  const sut = new SaveSurveyResultController(loadSurveyByIdStub, saveSurveyResultStub)
  return {
    sut,
    loadSurveyByIdStub,
    saveSurveyResultStub
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

  test('Should return 403 if invalid answer', async () => {
    const { sut } = makeSut()
    const httpRequest: HttpRequest = {
      body: {
        answer: 'invalidAnswer'
      },
      params: {
        surveyId: 'surveyId'
      }
    }

    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toEqual(forbidden(new InvalidParamError('answer')))
  })

  test('Should call SaveSurveyResult with correct values', async () => {
    const { sut, saveSurveyResultStub } = makeSut()
    const saveSpy = jest.spyOn(saveSurveyResultStub, 'save')
    const httpRequest = mockHttpRequest()

    await sut.handle(httpRequest)
    expect(saveSpy).toHaveBeenCalledWith({
      surveyId: httpRequest.params.surveyId,
      accountId: httpRequest.accountId,
      answer: httpRequest.body.answer,
      date: new Date()
    })
  })

  test('Should return 500 if SaveSurveyResult throws', async () => {
    const { sut, saveSurveyResultStub } = makeSut()
    jest.spyOn(saveSurveyResultStub, 'save').mockImplementationOnce(() => { throw new Error() })

    const httpResponse = await sut.handle(mockHttpRequest())
    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should return 200 on success', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle(mockHttpRequest())
    expect(httpResponse).toEqual(ok(mockSurveyResult()))
  })
})
