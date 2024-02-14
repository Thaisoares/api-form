export class InsertError extends Error {
  constructor (collection: string) {
    super(`Error while inserting on database: ${collection}`)
    this.name = 'InsertError'
  }
}
