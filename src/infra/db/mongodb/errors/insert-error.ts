export class InsertError extends Error {
  constructor () {
    super('Error while inserting on database')
    this.name = 'InsertError'
  }
}
