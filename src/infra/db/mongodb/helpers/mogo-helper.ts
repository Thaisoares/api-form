import { MongoClient, type Collection } from 'mongodb'
import { NoMongodbConnection } from '../errors'

export const MongoHelper = {
  client: null as MongoClient | null,
  uri: null as string | null,

  async connect (uri: string) {
    this.client = new MongoClient(uri)
    this.uri = uri
    await this.client.connect()
  },

  async disconnect () {
    if (this.client != null) {
      await this.client.close()
      this.client = null
    }
  },

  async getCollection (name: string): Promise<Collection> {
    if (this.client === null) {
      if (this.uri === null) throw new NoMongodbConnection()
      this.client = new MongoClient(this.uri)
      await this.client.connect()
    }
    return this.client.db().collection(name)
  },

  map (collection: any): any {
    const { _id, ...accountWithoutId } = collection
    const id = _id?.toString()
    return { ...accountWithoutId, id }
  }
}
