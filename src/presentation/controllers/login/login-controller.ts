import { badRequest, ok, serverError, unauthorized } from '../../helpers/http/http-helper'
import { type Validation } from '../signup/signup-controller-protocols'
import { type Controller, type HttpRequest, type HttpResponse, type Authentication } from './login-controller-protocols'

export class LoginController implements Controller {
  constructor (
    private readonly authentication: Authentication,
    private readonly validation: Validation
  ) {}

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const errorValidation = this.validation.validate(httpRequest.body)
      if (errorValidation) {
        return badRequest(errorValidation)
      }

      const { email, password } = httpRequest.body
      const accessToken = await this.authentication.auth({ email, password })
      if (!accessToken) return unauthorized()

      return ok({ accessToken })
    } catch (error) {
      return serverError(error)
    }
  }
}
