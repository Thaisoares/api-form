/* eslint-disable @typescript-eslint/no-misused-promises */
import jwt from 'jsonwebtoken'
import { JwtAdapter } from './jwt-adapter'

const secret = 'secret'

jest.mock('jsonwebtoken', () => ({
  async sign (): Promise<string> {
    return await Promise.resolve('token')
  }
}))

const makeSut = (): JwtAdapter => {
  const sut = new JwtAdapter(secret)
  return sut
}

describe('JWT Adapter', () => {
  test('Should call sign with correct values', async () => {
    const sut = makeSut()
    const signSpy = jest.spyOn(jwt, 'sign')
    await sut.encrypt('id')
    expect(signSpy).toHaveBeenCalledWith({ id: 'id' }, secret)
  })

  test('Should throw if sign throws', async () => {
    const sut = makeSut()
    jest.spyOn(jwt, 'sign').mockImplementationOnce(async () => { throw new Error() })
    const promise = sut.encrypt('id')
    await expect(promise).rejects.toThrow()
  })

  test('Should return token returned by sign', async () => {
    const sut = makeSut()
    const token = await sut.encrypt('id')
    expect(token).toBe('token')
  })
})
