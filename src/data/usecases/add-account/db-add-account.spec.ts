import { type AccountModel, type AddAccountModel, type AddAccountRepository, type Hasher } from './db-add-account-protocols'
import { DbAddAccount } from './db-add-account'

const makeAccountData = (): AddAccountModel => {
  return {
    name: 'name',
    email: 'email@mail.com',
    password: 'password'
  }
}

const makeHasher = (): Hasher => {
  class HasherStub implements Hasher {
    async hash (value: string): Promise<string> {
      return await new Promise(resolve => { resolve('hashedPassword') })
    }
  }
  return new HasherStub()
}

const makeAddAccountRepository = (): AddAccountRepository => {
  class AddAccountRepositoryStub implements AddAccountRepository {
    async add (accountData: AddAccountModel): Promise<AccountModel> {
      const fakeAccount = {
        id: 'id',
        name: accountData.name,
        email: accountData.email,
        password: 'hashedPassword'
      }
      return await new Promise(resolve => { resolve(fakeAccount) })
    }
  }
  return new AddAccountRepositoryStub()
}

interface SutTypes {
  sut: DbAddAccount
  hasherStub: Hasher
  addAccountRepositoryStub: AddAccountRepository
}

const makeSut = (): SutTypes => {
  const hasherStub = makeHasher()
  const addAccountRepositoryStub = makeAddAccountRepository()
  const sut = new DbAddAccount(hasherStub, addAccountRepositoryStub)
  return {
    sut,
    hasherStub,
    addAccountRepositoryStub
  }
}

describe('DbAddAccount Usecase', () => {
  test('Should call hasher with correct password', async () => {
    const { sut, hasherStub } = makeSut()
    const hasherSpy = jest.spyOn(hasherStub, 'hash')
    const accountData = makeAccountData()

    await sut.add(accountData)
    expect(hasherSpy).toHaveBeenCalledWith(accountData.password)
  })

  test('Should throw hasher throws', async () => {
    const { sut, hasherStub } = makeSut()
    jest.spyOn(hasherStub, 'hash').mockReturnValueOnce(Promise.reject(new Error()))
    const accountData = makeAccountData()

    const promiseHash = sut.add(accountData)
    await expect(promiseHash).rejects.toThrow()
  })

  test('Should call AddAccountRepository with correct values', async () => {
    const { sut, addAccountRepositoryStub } = makeSut()
    const addSpy = jest.spyOn(addAccountRepositoryStub, 'add')
    const accountData = makeAccountData()

    const account = await sut.add(accountData)
    expect(addSpy).toHaveBeenCalledWith({
      name: accountData.name,
      email: accountData.email,
      password: account.password
    })
  })

  test('Should throw AddAccountRepository throws', async () => {
    const { sut, addAccountRepositoryStub } = makeSut()
    jest.spyOn(addAccountRepositoryStub, 'add').mockReturnValueOnce(Promise.reject(new Error()))
    const accountData = makeAccountData()

    const promiseHash = sut.add(accountData)
    await expect(promiseHash).rejects.toThrow()
  })

  test('Should return an account on success', async () => {
    const { sut } = makeSut()
    const accountData = makeAccountData()

    const account = await sut.add(accountData)
    expect(account).toEqual({
      id: 'id',
      name: accountData.name,
      email: accountData.email,
      password: 'hashedPassword'
    })
  })
})
