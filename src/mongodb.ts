import { MongoClient } from 'mongodb'
import type { Db } from 'mongodb'
import type { Application } from './declarations'
import * as dotenv from 'dotenv'

dotenv.config()

declare module './declarations' {
  interface Configuration {
    mongodbClient: Promise<Db>
  }
}

export const mongodb = (app: Application) => {
  const connection = process.env.MONGODB_URI as string

  const database = new URL(connection).pathname.substring(1)
  const mongoClient = MongoClient.connect(connection).then((client) => client.db(database))

  app.set('mongodbClient', mongoClient)
}
