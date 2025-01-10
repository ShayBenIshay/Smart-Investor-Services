// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  agentTransactionsDataValidator,
  agentTransactionsPatchValidator,
  agentTransactionsQueryValidator,
  agentTransactionsResolver,
  agentTransactionsExternalResolver,
  agentTransactionsDataResolver,
  agentTransactionsPatchResolver,
  agentTransactionsQueryResolver
} from './agent-transactions.schema'

import type { Application } from '../../declarations'
import { AgentTransactionsService, getOptions } from './agent-transactions.class'
import { agentTransactionsPath, agentTransactionsMethods } from './agent-transactions.shared'

export * from './agent-transactions.class'
export * from './agent-transactions.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const agentTransactions = (app: Application) => {
  // Register our service on the Feathers application
  app.use(agentTransactionsPath, new AgentTransactionsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: agentTransactionsMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(agentTransactionsPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(agentTransactionsExternalResolver),
        schemaHooks.resolveResult(agentTransactionsResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(agentTransactionsQueryValidator),
        schemaHooks.resolveQuery(agentTransactionsQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(agentTransactionsDataValidator),
        schemaHooks.resolveData(agentTransactionsDataResolver)
      ],
      patch: [
        schemaHooks.validateData(agentTransactionsPatchValidator),
        schemaHooks.resolveData(agentTransactionsPatchResolver)
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
    [agentTransactionsPath]: AgentTransactionsService
  }
}
