import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  cacheDataValidator,
  cachePatchValidator,
  cacheQueryValidator,
  cacheResolver,
  cacheExternalResolver,
  cacheDataResolver,
  cachePatchResolver,
  cacheQueryResolver
} from './cache.schema.js'
import { CacheService, getOptions } from './cache.class.js'
import { cachePath, cacheMethods } from './cache.shared.js'
import { logCreateDocument } from '../../hooks/log-create-document.js'

export * from './cache.class.js'
export * from './cache.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const cache = async (app) => {
  // Register our service on the Feathers application
  app.use(cachePath, new CacheService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: cacheMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })

  // Create indexes
  const service = app.service(cachePath)
  const model = await service.options.Model
  await model.createIndex({ ticker: 1 }, { unique: true })
  await model.createIndex({ 'prices.date': 1 })

  // Initialize hooks
  service.hooks({
    around: {
      all: [
        // authenticate('jwt'),
        schemaHooks.resolveExternal(cacheExternalResolver),
        schemaHooks.resolveResult(cacheResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(cacheQueryValidator), schemaHooks.resolveQuery(cacheQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(cacheDataValidator), schemaHooks.resolveData(cacheDataResolver)],
      patch: [schemaHooks.validateData(cachePatchValidator), schemaHooks.resolveData(cachePatchResolver)],
      remove: []
    },
    after: {
      all: [],
      create: [logCreateDocument]
    },
    error: {
      all: []
    }
  })
}
