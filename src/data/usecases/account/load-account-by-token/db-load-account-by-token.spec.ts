import { type AccountModel, type Decrypter } from './db-load-account-by-token-protocols'
import { DbLoadAccountByToken } from './db-load-account-by-token'
import { type LoadAccountByTokenRepository } from '@/data/protocols/db/account/load-account-by-token-repository'

const loadData = {
  accessToken: 'accessToken',
  role: 'role'
}

const fakeAccount: AccountModel = {
  id: 'id',
  name: 'name',
  email: 'email@mail.com',
  password: 'hashedPassword'
}

const makeLoadAccountByTokenRepository = (): LoadAccountByTokenRepository => {
  class LoadAccountByTokenRepositoryStub implements LoadAccountByTokenRepository {
    async loadByToken (token: string, role?: string): Promise<AccountModel | null> {
      return await new Promise(resolve => { resolve(fakeAccount) })
    }
  }
  return new LoadAccountByTokenRepositoryStub()
}

const makeDecrypter = (): Decrypter => {
  class DecrypterStub implements Decrypter {
    async decrypt (value: string): Promise<string | null> {
      return await new Promise(resolve => { resolve('token') })
    }
  }
  return new DecrypterStub()
}

type SutTypes = {
  sut: DbLoadAccountByToken
  decrypterStub: Decrypter
  loadAccountByTokenRepositoryStub: LoadAccountByTokenRepository
}

const makeSut = (): SutTypes => {
  const decrypterStub = makeDecrypter()
  const loadAccountByTokenRepositoryStub = makeLoadAccountByTokenRepository()
  const sut = new DbLoadAccountByToken(decrypterStub, loadAccountByTokenRepositoryStub)
  return {
    sut,
    decrypterStub,
    loadAccountByTokenRepositoryStub
  }
}

describe('DbAddAccount Usecase', () => {
  test('Should call decrypt with correct accessToken', async () => {
    const { sut, decrypterStub } = makeSut()
    const decryptSpy = jest.spyOn(decrypterStub, 'decrypt')

    await sut.load(loadData.accessToken, loadData.role)
    expect(decryptSpy).toHaveBeenCalledWith(loadData.accessToken)
  })

  test('Should return null if decrypt returns null', async () => {
    const { sut, decrypterStub } = makeSut()
    jest.spyOn(decrypterStub, 'decrypt').mockReturnValueOnce(Promise.resolve(null))

    const account = await sut.load(loadData.accessToken, loadData.role)
    expect(account).toBeNull()
  })

  test('Should throw decrypt throws', async () => {
    const { sut, decrypterStub } = makeSut()
    jest.spyOn(decrypterStub, 'decrypt').mockReturnValueOnce(Promise.reject(new Error()))

    const promiseHash = sut.load(loadData.accessToken, loadData.role)
    await expect(promiseHash).rejects.toThrow()
  })

  test('Should return null if loadByToken returns null', async () => {
    const { sut, loadAccountByTokenRepositoryStub } = makeSut()
    jest.spyOn(loadAccountByTokenRepositoryStub, 'loadByToken').mockReturnValueOnce(Promise.resolve(null))

    const account = await sut.load(loadData.accessToken, loadData.role)
    expect(account).toBeNull()
  })

  test('Should return an account if success', async () => {
    const { sut } = makeSut()

    const account = await sut.load(loadData.accessToken, loadData.role)
    expect(account).toEqual(fakeAccount)
  })

  test('Should throw loadByToken throws', async () => {
    const { sut, loadAccountByTokenRepositoryStub } = makeSut()
    jest.spyOn(loadAccountByTokenRepositoryStub, 'loadByToken').mockReturnValueOnce(Promise.reject(new Error()))

    const promiseHash = sut.load(loadData.accessToken, loadData.role)
    await expect(promiseHash).rejects.toThrow()
  })
})
