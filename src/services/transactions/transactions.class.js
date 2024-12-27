// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import { MongoDBService } from '@feathersjs/mongodb'
import { ObjectId } from 'mongodb'

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class TransactionsService extends MongoDBService {
  setup(app) {
    this.app = app
  }
  async find(params) {
    const query = params.query
    const response = await super.find({
      query: {
        userId: new ObjectId(query.userId)
      }
    })
    return response.data
  }
}

export const getOptions = (app) => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('transactions'))
  }
}
