import { DbSaveSurveyResult } from './db-save-survey-result'
import { type SurveyResultModel, type SaveSurveyResultParams, type SaveSurveyResultRepository } from './db-save-survey-result-protocols'
import MockDate from 'mockdate'

const surveyResultData: SaveSurveyResultParams = {
  accountId: 'accountId',
  surveyId: 'surveyId',
  answer: 'answers',
  date: new Date()
}

const surveyResult: SurveyResultModel = Object.assign({}, surveyResultData, {
  id: 'id'
})

const makeSaveSurveyResultStub = (): SaveSurveyResultRepository => {
  class SaveSurveyResultRepositoryStub implements SaveSurveyResultRepository {
    async save (data: SaveSurveyResultParams): Promise<SurveyResultModel> {
      return await Promise.resolve(surveyResult)
    }
  }
  return new SaveSurveyResultRepositoryStub()
}

type SutTypes = {
  sut: DbSaveSurveyResult
  saveSurveyResultStub: SaveSurveyResultRepository
}
const makeSut = (): SutTypes => {
  const saveSurveyResultStub = makeSaveSurveyResultStub()
  const sut = new DbSaveSurveyResult(saveSurveyResultStub)
  return {
    sut,
    saveSurveyResultStub
  }
}

describe('DbSaveSuveyRepository UseCase', () => {
  beforeAll(() => {
    MockDate.set(new Date())
  })

  afterAll(() => {
    MockDate.reset()
  })

  test('Should call SaveSurveyRepository with correct value', async () => {
    const { sut, saveSurveyResultStub } = makeSut()
    const saveSpy = jest.spyOn(saveSurveyResultStub, 'save')

    await sut.save(surveyResultData)
    expect(saveSpy).toHaveBeenCalledWith(surveyResultData)
  })

  test('Should throw SaveSurveyRepository throws', async () => {
    const { sut, saveSurveyResultStub } = makeSut()
    jest.spyOn(saveSurveyResultStub, 'save').mockReturnValueOnce(Promise.reject(new Error()))

    const promise = sut.save(surveyResultData)
    await expect(promise).rejects.toThrow()
  })

  test('Should return result on success', async () => {
    const { sut } = makeSut()

    const saveResult = await sut.save(surveyResultData)
    expect(saveResult).toEqual(surveyResult)
  })
})
