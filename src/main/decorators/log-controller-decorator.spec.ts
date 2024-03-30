import { LogControllerDecorator } from './log-controller-decorator'
import { type LogErrorRepository } from '@/data/protocols/db/log/log-error-repository'
import { serverError } from '@/presentation/helpers/http/http-helper'
import { type Controller, type HttpRequest, type HttpResponse } from '@/presentation/protocols'

const mockHttpRequest = (): HttpRequest => {
  return {
    body: {
      name: 'name',
      email: 'email@mail.com',
      password: 'password',
      passwordConfirmation: 'password'
    }
  }
}

const mockLogErrorRepository = (): LogErrorRepository => {
  class LogErrorRepositoryStub implements LogErrorRepository {
    async log (stack: string): Promise<void> {
      await Promise.resolve()
    }
  }
  return new LogErrorRepositoryStub()
}

const mockController = (): Controller => {
  class ControllerStub implements Controller {
    async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
      const httpResponse = {
        statusCode: 200,
        body: { content: 'content' }
      }
      return await Promise.resolve(httpResponse)
    }
  }
  return new ControllerStub()
}

type sutTypes = {
  sut: LogControllerDecorator
  controllerStub: Controller
  logErrorRepositoryStub: LogErrorRepository
}

const makeSut = (): sutTypes => {
  const controllerStub = mockController()
  const logErrorRepositoryStub = mockLogErrorRepository()
  const sut = new LogControllerDecorator(controllerStub, logErrorRepositoryStub)
  return {
    sut,
    controllerStub,
    logErrorRepositoryStub
  }
}

describe('Decorator LogController', () => {
  test('Should calls handle of controller', async () => {
    const { sut, controllerStub } = makeSut()
    const controllerSpy = jest.spyOn(controllerStub, 'handle')

    const httpRequest = mockHttpRequest()
    await sut.handle(httpRequest)
    expect(controllerSpy).toHaveBeenCalledWith(httpRequest)
  })

  test('Should calls handle of controller', async () => {
    const { sut } = makeSut()
    const httpRequest = mockHttpRequest()
    const response = await sut.handle(httpRequest)
    expect(response).toEqual({
      statusCode: 200,
      body: { content: 'content' }
    })
  })

  test('Should callLogErrorRepository with correct error if controller returns a server error', async () => {
    const { sut, controllerStub, logErrorRepositoryStub } = makeSut()
    const fakeError = new Error()
    fakeError.stack = 'any_stack'
    jest.spyOn(controllerStub, 'handle').mockReturnValueOnce(Promise.resolve(serverError(fakeError)))
    const logSpy = jest.spyOn(logErrorRepositoryStub, 'log')

    const httpRequest = mockHttpRequest()
    await sut.handle(httpRequest)
    expect(logSpy).toHaveBeenCalledWith(fakeError.stack)
  })
})
