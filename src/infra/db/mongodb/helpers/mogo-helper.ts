import { MongoClient, type Collection } from 'mongodb'
import { NoMongodbConnection } from '../errors'

export const MongoHelper = {
  client: null as MongoClient | null,

  async connect (uri: string) {
    this.client = new MongoClient(uri)

    await this.client.connect()
  },

  async disconnect () {
    if (this.client) {
      await this.client.close()
    } else throw new NoMongodbConnection()
  },

  getCollection (name: string): Collection {
    if (this.client) {
      return this.client.db().collection(name)
    }
    throw new NoMongodbConnection()
  },

  map (collection: any): any {
    const { _id, ...accountWithoutId } = collection
    return { ...accountWithoutId, id: _id }
  }
}
