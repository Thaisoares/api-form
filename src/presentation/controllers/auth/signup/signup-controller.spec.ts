import { type AddAccount, type AddAccountParams, type AccountModel, type HttpRequest, type Validation, type Authentication, type AuthenticationParams } from './signup-controller-protocols'
import { SignUpController } from './signup-controller'
import { EmailInUseError, MissingParamError, ServerError } from '@/presentation/errors'
import { badRequest } from '@/presentation/helpers/http/http-helper'

const mockHttpRequest = (): HttpRequest => {
  return {
    body: {
      name: 'name',
      email: 'email@email.com',
      password: 'password',
      passwordConfirmation: 'password'
    }
  }
}

const mockAddAccount = (): AddAccount => {
  class AddAccountStub implements AddAccount {
    async add (account: AddAccountParams): Promise<AccountModel> {
      const fakeAccount = {
        id: 'valid-id',
        ...account
      }
      return await Promise.resolve(fakeAccount)
    }
  }
  return new AddAccountStub()
}

const mockValidation = (): Validation => {
  class ValidationStub implements Validation {
    validate (input: any): Error | null {
      return null
    }
  }
  return new ValidationStub()
}

const token = 'any_token'

const mockAuthenticationStub = (): Authentication => {
  class AuthenticationStub implements Authentication {
    async auth (authentication: AuthenticationParams): Promise<string | null> {
      return await Promise.resolve(token)
    }
  }
  return new AuthenticationStub()
}

type SutTypes = {
  sut: SignUpController
  addAccountStub: AddAccount
  validationStub: Validation
  authenticationStub: Authentication
}

const makeSut = (): SutTypes => {
  const addAccountStub = mockAddAccount()
  const validationStub = mockValidation()
  const authenticationStub = mockAuthenticationStub()
  const sut = new SignUpController(addAccountStub, validationStub, authenticationStub)
  return {
    sut,
    addAccountStub,
    validationStub,
    authenticationStub
  }
}

describe('SignUp Controller', () => {
  test('Should call AddAccount with correct values', async () => {
    const { sut, addAccountStub } = makeSut()
    const addSpy = jest.spyOn(addAccountStub, 'add')
    const httpRequest = mockHttpRequest()
    const { name, email, password } = httpRequest.body
    await sut.handle(httpRequest)
    expect(addSpy).toHaveBeenCalledWith({ name, email, password })
  })

  test('Should return 500 if addAccount throws', async () => {
    const { sut, addAccountStub } = makeSut()
    jest.spyOn(addAccountStub, 'add').mockImplementationOnce(async () => {
      return await Promise.reject(new Error())
    })

    const httpRequest = mockHttpRequest()
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toBeInstanceOf(ServerError)
  })

  test('Should return 200 and accessToken if data provided is correct', async () => {
    const { sut } = makeSut()
    const httpRequest = mockHttpRequest()
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body).toMatchObject({ accessToken: token })
  })

  test('Should call Validation with correct values', async () => {
    const { sut, validationStub } = makeSut()
    const validationSpy = jest.spyOn(validationStub, 'validate')
    const httpRequest = mockHttpRequest()
    await sut.handle(httpRequest)
    expect(validationSpy).toHaveBeenCalledWith(httpRequest.body)
  })

  test('Should return 400 if Validation returns an error', async () => {
    const { sut, validationStub } = makeSut()
    const error = new MissingParamError('filed')
    jest.spyOn(validationStub, 'validate').mockReturnValueOnce(error)
    const httpRequest = mockHttpRequest()

    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toEqual(badRequest(error))
  })

  test('Should call Authentication with correct values', async () => {
    const { sut, authenticationStub } = makeSut()
    const authSpy = jest.spyOn(authenticationStub, 'auth')
    const httpRequest = mockHttpRequest()
    const { email, password } = httpRequest.body
    await sut.handle(httpRequest)
    expect(authSpy).toHaveBeenCalledWith({ email, password })
  })

  test('Should return 500 if Authentication throws', async () => {
    const { sut, authenticationStub } = makeSut()
    jest.spyOn(authenticationStub, 'auth').mockImplementationOnce(() => { throw new Error() })
    const httpRequest = mockHttpRequest()

    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toBeInstanceOf(ServerError)
  })

  test('Should return 403 if email provided is already in use', async () => {
    const { sut, addAccountStub } = makeSut()
    jest.spyOn(addAccountStub, 'add').mockReturnValueOnce(Promise.resolve(null))
    const httpRequest = mockHttpRequest()
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(403)
    expect(httpResponse.body).toBeInstanceOf(EmailInUseError)
  })
})
