// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type {
  AgentPortfolio,
  AgentPortfolioData,
  AgentPortfolioPatch,
  AgentPortfolioQuery
} from './agent-portfolio.schema'

export type { AgentPortfolio, AgentPortfolioData, AgentPortfolioPatch, AgentPortfolioQuery }

export interface AgentPortfolioParams extends MongoDBAdapterParams<AgentPortfolioQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class AgentPortfolioService<
  ServiceParams extends Params = AgentPortfolioParams
> extends MongoDBService<AgentPortfolio, AgentPortfolioData, AgentPortfolioParams, AgentPortfolioPatch> {}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('agent-portfolio'))
  }
}
