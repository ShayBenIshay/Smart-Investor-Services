// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  throttleDataValidator,
  throttlePatchValidator,
  throttleQueryValidator,
  throttleResolver,
  throttleExternalResolver,
  throttleDataResolver,
  throttlePatchResolver,
  throttleQueryResolver
} from './throttle.schema'

import { ThrottleService, getOptions } from './throttle.class'
import { throttlePath, throttleMethods } from './throttle.shared'

export * from './throttle.class'
export * from './throttle.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const throttle = (app) => {
  // Register our service on the Feathers application
  app.use(throttlePath, new ThrottleService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: throttleMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })

  // Initialize hooks
  app.service(throttlePath).hooks({
    around: {
      all: [
        // authenticate('jwt'),
        schemaHooks.resolveExternal(throttleExternalResolver),
        schemaHooks.resolveResult(throttleResolver)
      ]
    },
    before: {
      all: [
        // schemaHooks.validateQuery(throttleQueryValidator),
        schemaHooks.resolveQuery(throttleQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        // schemaHooks.validateData(throttleDataValidator),
        schemaHooks.resolveData(throttleDataResolver)
      ],
      patch: [
        schemaHooks.validateData(throttlePatchValidator),
        schemaHooks.resolveData(throttlePatchResolver)
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
