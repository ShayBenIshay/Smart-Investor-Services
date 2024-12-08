// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type {
  Transactions,
  TransactionsData,
  TransactionsPatch,
  TransactionsQuery
} from './transactions.schema'

export type { Transactions, TransactionsData, TransactionsPatch, TransactionsQuery }

export interface TransactionsParams extends MongoDBAdapterParams<TransactionsQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class TransactionsService<ServiceParams extends Params = TransactionsParams> extends MongoDBService<
  Transactions,
  TransactionsData,
  TransactionsParams,
  TransactionsPatch
> {}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('transactions'))
  }
}
