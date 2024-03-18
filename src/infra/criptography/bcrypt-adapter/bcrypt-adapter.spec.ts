import { BcryptAdapter } from './bcrypt-adapter'
import bcrypt from 'bcrypt'

jest.mock('bcrypt', () => ({
  async hash (): Promise<string> {
    return await Promise.resolve('hashValue')
  },
  async compare (): Promise<boolean> {
    return await Promise.resolve(true)
  }
}))

type SutTypes = {
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
  test('Should call hash with correct value', async () => {
    const { sut, salt } = makeSut()
    const hashSpy = jest.spyOn(bcrypt, 'hash')
    const value = 'value'
    await sut.hash(value)
    expect(hashSpy).toHaveBeenCalledWith(value, salt)
  })

  test('Should return a valid hash if success on hash', async () => {
    const { sut } = makeSut()
    const hashedValue = await sut.hash('value')
    expect(hashedValue).toBe('hashValue')
  })

  test('Should throw if Bcrypt throws', async () => {
    const { sut } = makeSut()
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    jest.spyOn(bcrypt, 'hash').mockImplementationOnce(async () => { await Promise.reject(new Error()) })

    const returnedPromise = sut.hash('value')
    await expect(returnedPromise).rejects.toThrow()
  })

  test('Should call compare with correct values', async () => {
    const { sut } = makeSut()
    const compareSpy = jest.spyOn(bcrypt, 'compare')
    const value = 'value'
    await sut.compare(value, 'compareValue')
    expect(compareSpy).toHaveBeenCalledWith(value, 'compareValue')
  })

  test('Should return true if success on compare', async () => {
    const { sut } = makeSut()
    const compareResult = await sut.compare('value', 'compareValue')
    expect(compareResult).toBe(true)
  })

  test('Should return false if compare fails', async () => {
    const { sut } = makeSut()
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    jest.spyOn(bcrypt, 'compare').mockImplementationOnce(async () => await Promise.resolve(false))
    const compareResult = await sut.compare('value', 'compareValue')
    expect(compareResult).toBe(false)
  })
})
