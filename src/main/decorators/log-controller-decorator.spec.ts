import { LogControllerDecorator } from './log-controller-decorator'
import { type LogErrorRepository } from '@/data/protocols/db/log/log-error-repository'
import { serverError } from '@/presentation/helpers/http/http-helper'
import { type Controller, type HttpRequest, type HttpResponse } from '@/presentation/protocols'

const makeHttpRequest = (): HttpRequest => {
  return {
    body: {
      name: 'name',
      email: 'email@mail.com',
      password: 'password',
      passwordConfirmation: 'password'
    }
  }
}

const makeLogErrorRepository = (): LogErrorRepository => {
  class LogErrorRepositoryStub implements LogErrorRepository {
    async log (stack: string): Promise<void> {
      await new Promise<void>(resolve => { resolve() })
    }
  }
  return new LogErrorRepositoryStub()
}

const makeController = (): Controller => {
  class ControllerStub implements Controller {
    async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
      const httpResponse = {
        statusCode: 200,
        body: { content: 'content' }
      }
      return await new Promise(resolve => { resolve(httpResponse) })
    }
  }
  return new ControllerStub()
}

interface sutTypes {
  sut: LogControllerDecorator
  controllerStub: Controller
  logErrorRepositoryStub: LogErrorRepository
}

const makeSut = (): sutTypes => {
  const controllerStub = makeController()
  const logErrorRepositoryStub = makeLogErrorRepository()
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

    const httpRequest = makeHttpRequest()
    await sut.handle(httpRequest)
    expect(controllerSpy).toHaveBeenCalledWith(httpRequest)
  })

  test('Should calls handle of controller', async () => {
    const { sut } = makeSut()
    const httpRequest = makeHttpRequest()
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
    jest.spyOn(controllerStub, 'handle').mockReturnValueOnce(new Promise(resolve => { resolve(serverError(fakeError)) }))
    const logSpy = jest.spyOn(logErrorRepositoryStub, 'log')

    const httpRequest = makeHttpRequest()
    await sut.handle(httpRequest)
    expect(logSpy).toHaveBeenCalledWith(fakeError.stack)
  })
})
