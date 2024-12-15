import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type { Portfolio, PortfolioData, PortfolioPatch, PortfolioQuery } from './portfolio.schema'

export type { Portfolio, PortfolioData, PortfolioPatch, PortfolioQuery }

export interface PortfolioParams extends MongoDBAdapterParams<PortfolioQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class PortfolioService<ServiceParams extends Params = PortfolioParams> extends MongoDBService<
  Portfolio,
  PortfolioData,
  PortfolioParams,
  PortfolioPatch
> {}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('portfolio'))
  }
}
