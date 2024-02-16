import { LogControllerDecorator } from '../../decorators/log-controller-decorator'
import { LogMongoRepository } from '../../../infra/db/mongodb/log-repository/log-mongo-repository'
import { type Controller } from '../../../presentation/protocols'

export const makeLogControllerDecorator = (controller: Controller): Controller => {
  return new LogControllerDecorator(controller, new LogMongoRepository())
}
