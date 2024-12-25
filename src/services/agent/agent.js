// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'
import { createDocument } from '../../hooks/create-document'
import { createAgentPortfolio } from '../../hooks/create-portfolio'
import { handleCash } from '../../hooks/handle-cash'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  agentDataValidator,
  agentPatchValidator,
  agentQueryValidator,
  agentResolver,
  agentExternalResolver,
  agentDataResolver,
  agentPatchResolver,
  agentQueryResolver
} from './agent.schema'

import { AgentService, getOptions } from './agent.class'
import { agentPath, agentMethods } from './agent.shared'

export * from './agent.class'
export * from './agent.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const agent = (app) => {
  // Register our service on the Feathers application
  app.use(agentPath, new AgentService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: agentMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(agentPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(agentExternalResolver),
        schemaHooks.resolveResult(agentResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(agentQueryValidator), schemaHooks.resolveQuery(agentQueryResolver)],
      find: [],
      get: [],
      // create: [schemaHooks.validateData(agentDataValidator), schemaHooks.resolveData(agentDataResolver)],
      create: [handleCash, schemaHooks.resolveData(agentDataResolver)],
      patch: [schemaHooks.validateData(agentPatchValidator), schemaHooks.resolveData(agentPatchResolver)],
      remove: []
    },
    after: {
      create: [createDocument, createAgentPortfolio]
    },
    error: {
      all: []
    }
  })
}
