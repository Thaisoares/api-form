import { type HttpRequest, type LoadAccountByToken } from './auth-middleware-protocols'
import { AuthMiddleware } from './auth-middleware'
import { forbidden, ok, serverError } from '@/presentation/helpers/http/http-helper'
import { AccessDeniedError } from '@/presentation/errors'
import { type AccountModel } from '@/domain/models/account'

const token = 'token'
const httpRequest: HttpRequest = {
  headers: {
    'x-access-token': token
  }
}

const account: AccountModel = {
  id: 'id',
  name: 'name',
  email: 'email@email.com',
  password: 'encryptedPassword'
}

const makeLoadAccountByToken = (): LoadAccountByToken => {
  class LoadAccountByTokenStub implements LoadAccountByToken {
    async load (token: string, role?: string): Promise<AccountModel | null> {
      return await Promise.resolve(account)
    }
  }
  return new LoadAccountByTokenStub()
}

interface sutTypes {
  sut: AuthMiddleware
  loadAccountByTokenStub: LoadAccountByToken
}

const makeSut = (role?: string): sutTypes => {
  const loadAccountByTokenStub = makeLoadAccountByToken()
  const sut = new AuthMiddleware(loadAccountByTokenStub, role)
  return {
    sut,
    loadAccountByTokenStub
  }
}

describe('Auth Middleware', () => {
  test('Should return 403 if x-access-token doesn\'t exists in headerd', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle({})
    expect(httpResponse).toEqual(forbidden(new AccessDeniedError()))
  })

  test('Should call LoadAccountByToken with correct accessToken and role', async () => {
    const role = 'role'
    const { sut, loadAccountByTokenStub } = makeSut(role)
    const loadSpy = jest.spyOn(loadAccountByTokenStub, 'load')

    await sut.handle(httpRequest)
    expect(loadSpy).toHaveBeenCalledWith(token, role)
  })

  test('Should return 403 if LoadAccountByToken return null', async () => {
    const { sut, loadAccountByTokenStub } = makeSut()
    jest.spyOn(loadAccountByTokenStub, 'load').mockReturnValueOnce(Promise.resolve(null))

    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toEqual(forbidden(new AccessDeniedError()))
  })

  test('Should return 200 if LoadAccountByToken return an account', async () => {
    const { sut } = makeSut()

    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toEqual(ok({ accountId: account.id }))
  })

  test('Should return 500 if LoadAccountByToken throws', async () => {
    const { sut, loadAccountByTokenStub } = makeSut()
    const error = new Error()
    jest.spyOn(loadAccountByTokenStub, 'load').mockImplementationOnce(() => { throw error })

    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse).toEqual(serverError(error))
  })
})
