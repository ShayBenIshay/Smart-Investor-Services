// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type {
  AgentTransactions,
  AgentTransactionsData,
  AgentTransactionsPatch,
  AgentTransactionsQuery
} from './agent-transactions.schema'

export type { AgentTransactions, AgentTransactionsData, AgentTransactionsPatch, AgentTransactionsQuery }

export interface AgentTransactionsParams extends MongoDBAdapterParams<AgentTransactionsQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class AgentTransactionsService<
  ServiceParams extends Params = AgentTransactionsParams
> extends MongoDBService<
  AgentTransactions,
  AgentTransactionsData,
  AgentTransactionsParams,
  AgentTransactionsPatch
> {}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('agent-transactions'))
  }
}
