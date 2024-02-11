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
    if (this.client) {
      await this.client.close()
      this.client = null
      this.uri = null
    }
  },

  async getCollection (name: string): Promise<Collection> {
    if (this.client == null) {
      console.log(this.uri)
      if (!this.uri) throw new NoMongodbConnection()
      this.client = new MongoClient(this.uri)
      await this.client.connect()
    }
    return this.client.db().collection(name)
  },

  map (collection: any): any {
    const { _id, ...accountWithoutId } = collection
    return { ...accountWithoutId, id: _id }
  }
}
