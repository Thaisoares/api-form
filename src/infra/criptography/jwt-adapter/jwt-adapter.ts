import { type Decrypter } from '@/data/protocols/criptography/decrypter'
import { type Encrypter } from '@/data/protocols/criptography/encrypter'
import jwt, { type JwtPayload } from 'jsonwebtoken'

export class JwtAdapter implements Encrypter, Decrypter {
  constructor (private readonly secret: string) {}

  async encrypt (value: string): Promise<string> {
    const token = jwt.sign({ id: value }, this.secret)
    return token
  }

  async decrypt (token: string): Promise<string | null> {
    try {
      const value = jwt.verify(token, this.secret) as JwtPayload
      return value.id
    } catch (error) {
      return null
    }
  }
}
