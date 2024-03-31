import { type SurveyModel, type LoadSurveys } from './load-survey-controler-protocols'
import { LoadSurveysController } from './load-survey-controler'
import { noContent, ok, serverError } from '@/presentation/helpers/http/http-helper'

const surveys: SurveyModel[] = [{
  id: 'id',
  question: 'question',
  answers: [{
    image: 'image',
    answer: 'answer'
  }],
  date: new Date()
},
{
  id: 'id2',
  question: 'question2',
  answers: [{
    image: 'image',
    answer: 'answer'
  }, {
    answer: 'answer'
  }],
  date: new Date()
}
]

const mockLoadSurveys = (): LoadSurveys => {
  class LoadSurveysStub implements LoadSurveys {
    async load (): Promise<SurveyModel[]> {
      return await Promise.resolve(surveys)
    }
  }
  return new LoadSurveysStub()
}

type sutTypes = {
  sut: LoadSurveysController
  loadSurveysStub: LoadSurveys
}

const makeSut = (): sutTypes => {
  const loadSurveysStub = mockLoadSurveys()
  const sut = new LoadSurveysController(loadSurveysStub)
  return {
    sut,
    loadSurveysStub
  }
}

describe('Load Surveys Controller', () => {
  test('Should call LoadSurveys', async () => {
    const { sut, loadSurveysStub } = makeSut()
    const loadSpy = jest.spyOn(loadSurveysStub, 'load')

    await sut.handle({})
    expect(loadSpy).toHaveBeenCalled()
  })

  test('Should return 500 if LoadSurveys throws', async () => {
    const { sut, loadSurveysStub } = makeSut()
    jest.spyOn(loadSurveysStub, 'load').mockImplementationOnce(() => { throw new Error() })

    const httpResponse = await sut.handle({})
    expect(httpResponse).toEqual(serverError(new Error()))
  })

  test('Should return 200 and surveys on success', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle({})
    expect(httpResponse).toEqual(ok({ surveys }))
  })

  test('Should return 204 if no survey', async () => {
    const { sut, loadSurveysStub } = makeSut()
    const surveys: SurveyModel[] = []
    jest.spyOn(loadSurveysStub, 'load').mockReturnValueOnce(Promise.resolve(surveys))
    const httpResponse = await sut.handle({})
    expect(httpResponse).toEqual(noContent())
  })
})
