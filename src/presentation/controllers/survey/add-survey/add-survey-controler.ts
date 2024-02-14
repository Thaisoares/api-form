import { badRequest, noContent, ok, serverError } from "../../../helpers/http/http-helper";
import { AddSurvey, Controller, HttpRequest, HttpResponse, Validation } from "./add-survey-controler-protocols";

export class AddSurveyController implements Controller {
    constructor (
        private readonly validation: Validation,
        private readonly addSurvey: AddSurvey
      ) {}
      
    async handle(httpRequest: HttpRequest): Promise<HttpResponse>{
        try {
            const errorValidation = this.validation.validate(httpRequest.body)
            if (errorValidation) {
                return badRequest(errorValidation)
            }

            const { question, answers } = httpRequest.body
            this.addSurvey.add({ question, answers })
            
            return noContent()
        } catch (error) {
            return serverError(error)
        }
    }
}