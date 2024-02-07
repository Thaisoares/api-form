export class NoMongodbConnection extends Error {
  constructor () {
    super('No Mongodb Connection')
    this.name = 'NoMongodbConnection'
  }
}
