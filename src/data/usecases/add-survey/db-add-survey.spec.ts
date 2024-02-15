import { AddSurveyModel, AddSurveyRepository } from './db-add-survey-protocols'
import {DbAddSurvey} from './db-add-survey'

const makeAddSurvey = (): AddSurveyModel => {
    return {
        question: 'question',
        answers: [{
            image: 'image',
            answer: 'answer'
        }]
    }
}  

const makeAddSurveyRepository = (): AddSurveyRepository => {
    class AddSurveyRepositoryStub implements AddSurveyRepository {
        async add (data: AddSurveyModel): Promise<null> {
            return null
        }
    }
    return new AddSurveyRepositoryStub()
}
  
interface sutTypes {
    sut: DbAddSurvey
    addSurveyRepositoryStub: AddSurveyRepository
}

const makeSut = (): sutTypes => {
    const addSurveyRepositoryStub = makeAddSurveyRepository()
    const sut = new DbAddSurvey(addSurveyRepositoryStub)
    return {
        sut,
        addSurveyRepositoryStub
    }
}

describe('DbAddSurvey UseCase', () => {
    test('Should call AddSurveyRepository with correct values', async () => {
        const { sut, addSurveyRepositoryStub } = makeSut()
        const addSpy = jest.spyOn(addSurveyRepositoryStub, 'add')
        const survey = makeAddSurvey()

        await sut.add(survey)
        expect(addSpy).toHaveBeenCalledWith(survey)
    })

    test('Should throw if AddSurveyRepository throws', async () => {
        const { sut, addSurveyRepositoryStub } = makeSut()
        jest.spyOn(addSurveyRepositoryStub, 'add').mockImplementationOnce(() => { throw new Error() })
        const survey = makeAddSurvey()

        const promise = sut.add(survey)
        await expect(promise).rejects.toThrow()
    })
})