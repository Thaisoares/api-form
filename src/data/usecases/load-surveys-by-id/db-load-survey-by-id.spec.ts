import { type LoadSurveyByIdRepository, type SurveyModel } from '../load-surveys-by-id/db-load-survey-by-id-protocols'
import { DbLoadSurveyById } from './db-load-survey-by-id'

const survey: SurveyModel = {
  id: 'id',
  question: 'question',
  answers: [{
    image: 'image',
    answer: 'answer'
  }],
  date: new Date()
}

const makeLoadSurveyByIdRepository = (): LoadSurveyByIdRepository => {
  class LoadSurveyByIdRepositoryStub implements LoadSurveyByIdRepository {
    async loadById (): Promise<SurveyModel | null> {
      return await Promise.resolve(survey)
    }
  }
  return new LoadSurveyByIdRepositoryStub()
}

type sutTypes = {
  sut: DbLoadSurveyById
  loadSurveyByIdRepositoryStub: LoadSurveyByIdRepository
}

const makeSut = (): sutTypes => {
  const loadSurveyByIdRepositoryStub = makeLoadSurveyByIdRepository()
  const sut = new DbLoadSurveyById(loadSurveyByIdRepositoryStub)
  return {
    sut,
    loadSurveyByIdRepositoryStub
  }
}

describe('DbLoadSurveyById UseCase', () => {
  test('Should call LoadSurveyByIdRepository with correct values', async () => {
    const { sut, loadSurveyByIdRepositoryStub } = makeSut()
    const loadByIdSpy = jest.spyOn(loadSurveyByIdRepositoryStub, 'loadById')

    const id = 'id'
    await sut.loadById(id)
    expect(loadByIdSpy).toHaveBeenCalledWith(id)
  })

  test('Should throw if loadByIdSpy throws', async () => {
    const { sut, loadSurveyByIdRepositoryStub } = makeSut()
    jest.spyOn(loadSurveyByIdRepositoryStub, 'loadById').mockImplementationOnce(() => { throw new Error() })

    const promise = sut.loadById(survey.id)
    await expect(promise).rejects.toThrow()
  })

  test('Should return same as loadById', async () => {
    const { sut } = makeSut()

    const returnedSurveys = await sut.loadById(survey.id)
    expect(returnedSurveys).toEqual(survey)
  })
})
