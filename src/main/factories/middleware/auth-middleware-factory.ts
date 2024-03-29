import { AuthMiddleware } from '@/presentation/middlewares/auth-middleware'
import { type Middleware } from '@/presentation/protocols'
import { makeDbLoadAccountByToken } from '../use-cases/account/db-load-account-by-token-factory'

export const makeAuthMiddleware = (role?: string): Middleware => {
  return new AuthMiddleware(makeDbLoadAccountByToken(), role)
}
