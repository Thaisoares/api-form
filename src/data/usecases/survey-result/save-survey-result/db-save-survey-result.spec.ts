import { type LoadSurveyResultRepository } from '../load-survey-result/db-load-survey-result-protocols'
import { DbSaveSurveyResult } from './db-save-survey-result'
import { type SurveyResultModel, type SaveSurveyResultParams, type SaveSurveyResultRepository } from './db-save-survey-result-protocols'
import MockDate from 'mockdate'

const surveyResultData: SaveSurveyResultParams = {
  accountId: 'accountId',
  surveyId: 'surveyId',
  answer: 'answer',
  date: new Date()
}

const surveyResult: SurveyResultModel = {
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

const makeSaveSurveyResultStub = (): SaveSurveyResultRepository => {
  class SaveSurveyResultRepositoryStub implements SaveSurveyResultRepository {
    async save (data: SaveSurveyResultParams): Promise<void> {
    }
  }
  return new SaveSurveyResultRepositoryStub()
}

const makeLoadSurveyResultStub = (): LoadSurveyResultRepository => {
  class LoadSurveyResultRepositoryStub implements LoadSurveyResultRepository {
    async loadBySurveyId (surveyId: string): Promise<SurveyResultModel | null> {
      return surveyResult
    }
  }
  return new LoadSurveyResultRepositoryStub()
}

type SutTypes = {
  sut: DbSaveSurveyResult
  saveSurveyResultStub: SaveSurveyResultRepository
  loadSurveyResultRepositoryStub: LoadSurveyResultRepository
}
const makeSut = (): SutTypes => {
  const saveSurveyResultStub = makeSaveSurveyResultStub()
  const loadSurveyResultRepositoryStub = makeLoadSurveyResultStub()
  const sut = new DbSaveSurveyResult(saveSurveyResultStub, loadSurveyResultRepositoryStub)
  return {
    sut,
    saveSurveyResultStub,
    loadSurveyResultRepositoryStub
  }
}

describe('DbSaveSuveyRepository UseCase', () => {
  beforeAll(() => {
    MockDate.set(new Date())
  })

  afterAll(() => {
    MockDate.reset()
  })

  test('Should call SaveSurveyRepository', async () => {
    const { sut, saveSurveyResultStub } = makeSut()
    const saveSpy = jest.spyOn(saveSurveyResultStub, 'save')

    await sut.save(surveyResultData)
    expect(saveSpy).toHaveBeenCalled()
  })

  test('Should throw SaveSurveyRepository throws', async () => {
    const { sut, saveSurveyResultStub } = makeSut()
    jest.spyOn(saveSurveyResultStub, 'save').mockReturnValueOnce(Promise.reject(new Error()))

    const promise = sut.save(surveyResultData)
    await expect(promise).rejects.toThrow()
  })

  test('Should call LoadSurveyResultRepository with correct value', async () => {
    const { sut, loadSurveyResultRepositoryStub } = makeSut()
    const loadSpy = jest.spyOn(loadSurveyResultRepositoryStub, 'loadBySurveyId')

    await sut.save(surveyResultData)
    expect(loadSpy).toHaveBeenCalledWith(surveyResultData.surveyId)
  })

  test('Should throw LoadSurveyResultRepository throws', async () => {
    const { sut, loadSurveyResultRepositoryStub } = makeSut()
    jest.spyOn(loadSurveyResultRepositoryStub, 'loadBySurveyId').mockReturnValueOnce(Promise.reject(new Error()))

    const promise = sut.save(surveyResultData)
    await expect(promise).rejects.toThrow()
  })

  test('Should return result on success', async () => {
    const { sut } = makeSut()

    const saveResult = await sut.save(surveyResultData)
    expect(saveResult).toEqual(surveyResult)
  })
})
