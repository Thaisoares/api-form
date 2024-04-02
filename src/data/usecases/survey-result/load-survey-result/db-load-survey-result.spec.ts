import { DbLoadSurveyResult } from './db-load-survey-result'
import { type SurveyResultModel, type LoadSurveyResultRepository, type LoadSurveyByIdRepository, type SurveyModel } from './db-load-survey-result-protocols'
import MockDate from 'mockdate'

const surveyResult: SurveyResultModel = {
  surveyId: 'surveyId',
  question: 'question',
  answers: [{
    image: 'image',
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

const survey: SurveyModel = {
  id: 'surveyId',
  question: 'question',
  answers: [{
    image: 'image',
    answer: 'answer'
  }, {
    answer: 'answer2'
  }],
  date: new Date()
}

const makeLoadSurveyResultStub = (): LoadSurveyResultRepository => {
  class LoadSurveyResultRepositoryStub implements LoadSurveyResultRepository {
    async loadBySurveyId (surveyId: string): Promise<SurveyResultModel> {
      return await Promise.resolve(surveyResult)
    }
  }
  return new LoadSurveyResultRepositoryStub()
}

const makeLoadSurveyByIdStub = (): LoadSurveyByIdRepository => {
  class LoadSurveyByIdRepositoryStub implements LoadSurveyByIdRepository {
    async loadById (id: string): Promise<SurveyModel | null> {
      return await Promise.resolve(survey)
    }
  }
  return new LoadSurveyByIdRepositoryStub()
}

type SutTypes = {
  sut: DbLoadSurveyResult
  loadSurveyResultStub: LoadSurveyResultRepository
  loadSurveyByIdStub: LoadSurveyByIdRepository
}
const makeSut = (): SutTypes => {
  const loadSurveyResultStub = makeLoadSurveyResultStub()
  const loadSurveyByIdStub = makeLoadSurveyByIdStub()
  const sut = new DbLoadSurveyResult(loadSurveyResultStub, loadSurveyByIdStub)
  return {
    sut,
    loadSurveyResultStub,
    loadSurveyByIdStub
  }
}

describe('DbSaveSuveyRepository UseCase', () => {
  beforeAll(() => {
    MockDate.set(new Date())
  })

  afterAll(() => {
    MockDate.reset()
  })

  test('Should call LoadSurveyResult with correct value', async () => {
    const { sut, loadSurveyResultStub } = makeSut()
    const loadSpy = jest.spyOn(loadSurveyResultStub, 'loadBySurveyId')
    const surveyId = 'surveyId'

    await sut.load(surveyId)
    expect(loadSpy).toHaveBeenCalledWith(surveyId)
  })

  test('Should throw LoadSurveyResult throws', async () => {
    const { sut, loadSurveyResultStub } = makeSut()
    jest.spyOn(loadSurveyResultStub, 'loadBySurveyId').mockReturnValueOnce(Promise.reject(new Error()))

    const promise = sut.load('surveyId')
    await expect(promise).rejects.toThrow()
  })

  test('Should call LoadSurveyById if LoadSurveyResult returns null', async () => {
    const { sut, loadSurveyResultStub, loadSurveyByIdStub } = makeSut()
    jest.spyOn(loadSurveyResultStub, 'loadBySurveyId').mockReturnValueOnce(Promise.resolve(null))
    const loadSpy = jest.spyOn(loadSurveyByIdStub, 'loadById')
    const surveyId = 'surveyId'

    await sut.load(surveyId)
    expect(loadSpy).toHaveBeenCalledWith(surveyId)
  })

  test('Should return resultModel with all counts equal 0 if LoadSurveyResult returns null', async () => {
    const { sut, loadSurveyResultStub } = makeSut()
    jest.spyOn(loadSurveyResultStub, 'loadBySurveyId').mockReturnValueOnce(Promise.resolve(null))
    const surveyId = 'surveyId'

    const saveResult = await sut.load(surveyId)
    expect(saveResult.surveyId).toBe(surveyId)
    const sumCounts = saveResult.answers.reduce((sum, a) => sum + a.count, 0)
    expect(sumCounts).toBe(0)
  })

  test('Should return result on success', async () => {
    const { sut } = makeSut()

    const saveResult = await sut.load('surveyId')
    expect(saveResult).toEqual(surveyResult)
  })
})
