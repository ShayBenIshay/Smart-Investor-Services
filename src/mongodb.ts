// For more information about this file see https://dove.feathersjs.com/guides/cli/databases.html
import { MongoClient } from 'mongodb'
import type { Db } from 'mongodb'
import type { Application } from './declarations'

const mongodbUri = process.env.MONGODB_URI

if (!mongodbUri) {
  throw new Error('MONGODB_URI environment variable is not set')
}

declare module './declarations' {
  interface Configuration {
    mongodbClient: Promise<Db>
  }
}

export const mongodb = (app: Application) => {
  const database = new URL(mongodbUri).pathname.substring(1)
  const mongoClient = MongoClient.connect(mongodbUri).then((client) => client.db(database))

  app.set('mongodbClient', mongoClient)
}
