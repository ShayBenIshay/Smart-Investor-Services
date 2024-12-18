//test commit
import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  polygonApiDataValidator,
  polygonApiPatchValidator,
  polygonApiQueryValidator,
  polygonApiResolver,
  polygonApiExternalResolver,
  polygonApiDataResolver,
  polygonApiPatchResolver,
  polygonApiQueryResolver
} from './polygon-api.schema.js'
import { PolygonApiService, getOptions } from './polygon-api.class.js'
import { polygonApiPath, polygonApiMethods } from './polygon-api.shared.js'

export * from './polygon-api.class.js'
export * from './polygon-api.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const polygonApi = (app) => {
  // Register our service on the Feathers application
  app.use(polygonApiPath, new PolygonApiService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: polygonApiMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(polygonApiPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(polygonApiExternalResolver),
        schemaHooks.resolveResult(polygonApiResolver)
      ]
    },
    before: {
      all: [
        // schemaHooks.validateQuery(polygonApiQueryValidator),
        schemaHooks.resolveQuery(polygonApiQueryResolver)
      ],
      find: []
      // create: [
      //   schemaHooks.validateData(polygonApiDataValidator),
      //   schemaHooks.resolveData(polygonApiDataResolver)
      // ],
      // patch: [
      //   schemaHooks.validateData(polygonApiPatchValidator),
      //   schemaHooks.resolveData(polygonApiPatchResolver)
      // ],
      // remove: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}
