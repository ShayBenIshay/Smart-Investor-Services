// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  agentPortfolioDataValidator,
  agentPortfolioPatchValidator,
  agentPortfolioQueryValidator,
  agentPortfolioResolver,
  agentPortfolioExternalResolver,
  agentPortfolioDataResolver,
  agentPortfolioPatchResolver,
  agentPortfolioQueryResolver
} from './agent-portfolio.schema'

import type { Application } from '../../declarations'
import { AgentPortfolioService, getOptions } from './agent-portfolio.class'
import { agentPortfolioPath, agentPortfolioMethods } from './agent-portfolio.shared'

export * from './agent-portfolio.class'
export * from './agent-portfolio.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const agentPortfolio = (app: Application) => {
  // Register our service on the Feathers application
  app.use(agentPortfolioPath, new AgentPortfolioService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: agentPortfolioMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(agentPortfolioPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(agentPortfolioExternalResolver),
        schemaHooks.resolveResult(agentPortfolioResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(agentPortfolioQueryValidator),
        schemaHooks.resolveQuery(agentPortfolioQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(agentPortfolioDataValidator),
        schemaHooks.resolveData(agentPortfolioDataResolver)
      ],
      patch: [
        schemaHooks.validateData(agentPortfolioPatchValidator),
        schemaHooks.resolveData(agentPortfolioPatchResolver)
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
    [agentPortfolioPath]: AgentPortfolioService
  }
}
