import { BcryptAdapter } from './bcrypt-adapter'
import bcrypt from 'bcrypt'

jest.mock('bcrypt', () => ({
  async hash (): Promise<string> {
    return await new Promise(resolve => { resolve('hashValue') })
  }
}))

interface SutTypes {
  sut: BcryptAdapter
  salt: number
}

const makeSut = (): SutTypes => {
  const salt = 12
  const sut = new BcryptAdapter(salt)
  return {
    sut, salt
  }
}

describe('Bcrypt Adapter', () => {
  test('Should Call bcrypt with correct value', async () => {
    const { sut, salt } = makeSut()
    const hashSpy = jest.spyOn(bcrypt, 'hash')
    const value = 'value'
    await sut.encrypt(value)
    expect(hashSpy).toHaveBeenCalledWith(value, salt)
  })

  test('Should return a hash if success', async () => {
    const { sut } = makeSut()
    const hashedValue = await sut.encrypt('value')
    expect(hashedValue).toBe('hashValue')
  })

  test('Should throw if Bcrypt throws', async () => {
    const { sut } = makeSut()
    jest.spyOn(bcrypt, 'hash').mockImplementationOnce(async () => { await new Promise((resolve, reject) => { reject(new Error()) }) })
    // jest.spyOn(bcrypt, 'hash').mockReturnValueOnce( new Promise((resolve, reject) => { reject(new Error()) }))

    const returnedPromise = sut.encrypt('value')
    await expect(returnedPromise).rejects.toThrow()
  })
})
