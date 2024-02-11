import { type AccountModel, type AddAccountModel, type AddAccountRepository, type Encrypter } from './db-add-account-protocols'
import { DbAddAccount } from './db-add-account'

const makeAccountData = (): AddAccountModel => {
  return {
    name: 'name',
    email: 'email@mail.com',
    password: 'password'
  }
}

const makeEncrypter = (): Encrypter => {
  class EncrypterStub implements Encrypter {
    async encrypt (value: string): Promise<string> {
      return await new Promise(resolve => { resolve('encryptedPassword') })
    }
  }
  return new EncrypterStub()
}

const makeAddAccountRepository = (): AddAccountRepository => {
  class AddAccountRepositoryStub implements AddAccountRepository {
    async add (accountData: AddAccountModel): Promise<AccountModel> {
      const fakeAccount = {
        id: 'id',
        name: accountData.name,
        email: accountData.email,
        password: 'encryptedPassword'
      }
      return await new Promise(resolve => { resolve(fakeAccount) })
    }
  }
  return new AddAccountRepositoryStub()
}

interface SutTypes {
  sut: DbAddAccount
  encrypterStub: Encrypter
  addAccountRepositoryStub: AddAccountRepository
}

const makeSut = (): SutTypes => {
  const encrypterStub = makeEncrypter()
  const addAccountRepositoryStub = makeAddAccountRepository()
  const sut = new DbAddAccount(encrypterStub, addAccountRepositoryStub)
  return {
    sut,
    encrypterStub,
    addAccountRepositoryStub
  }
}

describe('DbAddAccount Usecase', () => {
  test('Should call Encrypter with correct password', async () => {
    const { sut, encrypterStub } = makeSut()
    const encrypterSpy = jest.spyOn(encrypterStub, 'encrypt')
    const accountData = makeAccountData()

    await sut.add(accountData)
    expect(encrypterSpy).toHaveBeenCalledWith(accountData.password)
  })

  test('Should throw Encrypter throws', async () => {
    const { sut, encrypterStub } = makeSut()
    jest.spyOn(encrypterStub, 'encrypt').mockReturnValueOnce(new Promise((resolve, reject) => { reject(new Error()) }))
    const accountData = makeAccountData()

    const promiseEncrypt = sut.add(accountData)
    await expect(promiseEncrypt).rejects.toThrow()
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
    jest.spyOn(addAccountRepositoryStub, 'add').mockReturnValueOnce(new Promise((resolve, reject) => { reject(new Error()) }))
    const accountData = makeAccountData()

    const promiseEncrypt = sut.add(accountData)
    await expect(promiseEncrypt).rejects.toThrow()
  })

  test('Should return an account on success', async () => {
    const { sut } = makeSut()
    const accountData = makeAccountData()

    const account = await sut.add(accountData)
    expect(account).toEqual({
      id: 'id',
      name: accountData.name,
      email: accountData.email,
      password: 'encryptedPassword'
    })
  })
})
