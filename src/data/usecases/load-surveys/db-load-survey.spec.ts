import { type LoadSurveysRepository, type SurveyModel } from './db-load-survey-protocols'
import { DbLoadSurvey } from './db-load-survey'

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

const makeLoadSurveysRepository = (): LoadSurveysRepository => {
  class LoadSurveysRepositoryStub implements LoadSurveysRepository {
    async loadAll (): Promise<SurveyModel[]> {
      return await Promise.resolve(surveys)
    }
  }
  return new LoadSurveysRepositoryStub()
}

interface sutTypes {
  sut: DbLoadSurvey
  loadSurveysRepositoryStub: LoadSurveysRepository
}

const makeSut = (): sutTypes => {
  const loadSurveysRepositoryStub = makeLoadSurveysRepository()
  const sut = new DbLoadSurvey(loadSurveysRepositoryStub)
  return {
    sut,
    loadSurveysRepositoryStub
  }
}

describe('DbLoadSurvey UseCase', () => {
  test('Should call LoadSurveyRepository with correct values', async () => {
    const { sut, loadSurveysRepositoryStub } = makeSut()
    const loadSpy = jest.spyOn(loadSurveysRepositoryStub, 'loadAll')

    await sut.load()
    expect(loadSpy).toHaveBeenCalled()
  })

  test('Should throw if AddSurveyRepository throws', async () => {
    const { sut, loadSurveysRepositoryStub } = makeSut()
    jest.spyOn(loadSurveysRepositoryStub, 'loadAll').mockImplementationOnce(() => { throw new Error() })

    const promise = sut.load()
    await expect(promise).rejects.toThrow()
  })

  test('Should return same as LoadSurveyRepository', async () => {
    const { sut } = makeSut()

    const returnedSurveys = await sut.load()
    expect(returnedSurveys).toEqual(surveys)
  })
})
