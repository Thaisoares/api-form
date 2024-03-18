import { type AccountModel, type AuthenticationModel, type HashComparer, type LoadAccountByEmailRepository, type Encrypter, type UpdateAccessTokenRepository } from './db-authenticate-protocols'
import { DbAuthentication } from './db-authentication'

const fakeAccount: AccountModel = {
  id: 'id',
  name: 'name',
  email: 'email@mail.com',
  password: 'hashedPassword'
}

const fakeAuthenticate: AuthenticationModel = {
  email: 'email@mail.com',
  password: 'password'
}

const makeLoadAccountByEmailRepositoryStub = (): LoadAccountByEmailRepository => {
  class LoadAccountByEmailRepositoryStub implements LoadAccountByEmailRepository {
    async loadByEmail (email: string): Promise<AccountModel | null> {
      return await Promise.resolve(fakeAccount)
    }
  }
  return new LoadAccountByEmailRepositoryStub()
}

const makeHashComparerStub = (): HashComparer => {
  class HashComparerStub implements HashComparer {
    async compare (value: string, hash: string): Promise<boolean> {
      return await Promise.resolve(true)
    }
  }
  return new HashComparerStub()
}

const makeEncrypterStub = (): Encrypter => {
  class EncrypterStub implements Encrypter {
    async encrypt (id: string): Promise<string> {
      return await Promise.resolve('token')
    }
  }
  return new EncrypterStub()
}

const makeUpdateAccessTokenRepositoryStub = (): UpdateAccessTokenRepository => {
  class UpdateAccessTokenRepositoryStub implements UpdateAccessTokenRepository {
    async updateAccessToken (id: string, token: string): Promise<void> {
      await Promise.resolve()
    }
  }
  return new UpdateAccessTokenRepositoryStub()
}

type sutTypes = {
  sut: DbAuthentication
  loadAccountByEmailRepositoryStub: LoadAccountByEmailRepository
  hashCompareStub: HashComparer
  EncrypterStub: Encrypter
  updateAccessTokenRepositoryStub: UpdateAccessTokenRepository
}

const makeSut = (): sutTypes => {
  const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepositoryStub()
  const hashCompareStub = makeHashComparerStub()
  const EncrypterStub = makeEncrypterStub()
  const updateAccessTokenRepositoryStub = makeUpdateAccessTokenRepositoryStub()
  const sut = new DbAuthentication(loadAccountByEmailRepositoryStub, hashCompareStub, EncrypterStub, updateAccessTokenRepositoryStub)
  return {
    sut,
    loadAccountByEmailRepositoryStub,
    hashCompareStub,
    EncrypterStub,
    updateAccessTokenRepositoryStub
  }
}

describe('DbAuthentication UseCase', () => {
  test('Should call LoadAccountByEmailRepository with correct email', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    const loadSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail')

    await sut.auth(fakeAuthenticate)
    expect(loadSpy).toHaveBeenCalledWith(fakeAccount.email)
  })

  test('Should throw if LoadAccountByEmailRepository throws', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockReturnValueOnce(Promise.reject(new Error()))

    const promise = sut.auth(fakeAuthenticate)
    await expect(promise).rejects.toThrow()
  })

  test('Should return null if LoadAccountByEmailRepository return null', async () => {
    const { sut, loadAccountByEmailRepositoryStub } = makeSut()
    jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockReturnValueOnce(Promise.resolve(null))

    const acessToken = await sut.auth(fakeAuthenticate)
    expect(acessToken).toBe(null)
  })

  test('Should call HashCompare with correct password', async () => {
    const { sut, hashCompareStub } = makeSut()
    const compareSpy = jest.spyOn(hashCompareStub, 'compare')

    await sut.auth(fakeAuthenticate)
    expect(compareSpy).toHaveBeenCalledWith(fakeAuthenticate.password, fakeAccount.password)
  })

  test('Should throw if HashCompare throws', async () => {
    const { sut, hashCompareStub } = makeSut()
    jest.spyOn(hashCompareStub, 'compare').mockReturnValueOnce(Promise.reject(new Error()))

    const promise = sut.auth(fakeAuthenticate)
    await expect(promise).rejects.toThrow()
  })

  test('Should return null if HashCompare return false', async () => {
    const { sut, hashCompareStub } = makeSut()
    jest.spyOn(hashCompareStub, 'compare').mockReturnValueOnce(Promise.resolve(false))

    const acessToken = await sut.auth(fakeAuthenticate)
    expect(acessToken).toBe(null)
  })

  test('Should call Encrypter with correct id', async () => {
    const { sut, EncrypterStub } = makeSut()
    const encryptSpy = jest.spyOn(EncrypterStub, 'encrypt')

    await sut.auth(fakeAuthenticate)
    expect(encryptSpy).toHaveBeenCalledWith(fakeAccount.id)
  })

  test('Should throw if Encrypter throws', async () => {
    const { sut, EncrypterStub } = makeSut()
    jest.spyOn(EncrypterStub, 'encrypt').mockReturnValueOnce(Promise.reject(new Error()))

    const promise = sut.auth(fakeAuthenticate)
    await expect(promise).rejects.toThrow()
  })

  test('Should return token if all parameters are valid', async () => {
    const { sut } = makeSut()

    const promise = await sut.auth(fakeAuthenticate)
    expect(promise).toBe('token')
  })

  test('Should call UpdateAccessTokenRepository with correct values', async () => {
    const { sut, updateAccessTokenRepositoryStub } = makeSut()
    const updateSpy = jest.spyOn(updateAccessTokenRepositoryStub, 'updateAccessToken')

    await sut.auth(fakeAuthenticate)
    expect(updateSpy).toHaveBeenCalledWith(fakeAccount.id, 'token')
  })

  test('Should throw if UpdateAccessTokenRepository throws', async () => {
    const { sut, updateAccessTokenRepositoryStub } = makeSut()
    jest.spyOn(updateAccessTokenRepositoryStub, 'updateAccessToken').mockReturnValueOnce(Promise.reject(new Error()))

    const promise = sut.auth(fakeAuthenticate)
    await expect(promise).rejects.toThrow()
  })
})
