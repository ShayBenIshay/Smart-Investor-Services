// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  portfolioDataValidator,
  portfolioPatchValidator,
  portfolioQueryValidator,
  portfolioResolver,
  portfolioExternalResolver,
  portfolioDataResolver,
  portfolioPatchResolver,
  portfolioQueryResolver
} from './portfolio.schema'

import type { Application } from '../../declarations'
import { PortfolioService, getOptions } from './portfolio.class'
import { portfolioPath, portfolioMethods } from './portfolio.shared'

export * from './portfolio.class'
export * from './portfolio.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const portfolio = (app: Application) => {
  // Register our service on the Feathers application
  app.use(portfolioPath, new PortfolioService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: portfolioMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(portfolioPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(portfolioExternalResolver),
        schemaHooks.resolveResult(portfolioResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(portfolioQueryValidator),
        schemaHooks.resolveQuery(portfolioQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(portfolioDataValidator),
        schemaHooks.resolveData(portfolioDataResolver)
      ],
      patch: [
        schemaHooks.validateData(portfolioPatchValidator),
        schemaHooks.resolveData(portfolioPatchResolver)
      ],
      remove: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [portfolioPath]: PortfolioService
  }
}