import { EmailInUseError } from '../../../errors'
import { badRequest, forbidden, ok, serverError } from '../../../helpers/http/http-helper'
import { type HttpRequest, type HttpResponse, type Controller, type AddAccount, type Validation, Authentication } from './signup-controller-protocols'

export class SignUpController implements Controller {
  constructor (
    private readonly addAccount: AddAccount,
    private readonly validation: Validation,
    private readonly authentication: Authentication,
  ) {}

  async handle (httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const errorValidation = this.validation.validate(httpRequest.body)
      if (errorValidation) {
        return badRequest(errorValidation)
      }

      const { name, email, password } = httpRequest.body

      const account = await this.addAccount.add({
        name, email, password
      })
      if(!account) return forbidden(new EmailInUseError())
      
      const accessToken = await this.authentication.auth({ email, password })

      return ok({ accessToken })
    } catch (error) {
      return serverError(error)
    }
  }
}
