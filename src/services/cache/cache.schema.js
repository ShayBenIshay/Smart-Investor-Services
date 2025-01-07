// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'

const PriceSchema = Type.Object(
  {
    date: Type.String({
      pattern: '^\\d{4}-\\d{2}-\\d{2}$' // YYYY-MM-DD format
    }),
    closePrice: Type.Number({
      minimum: 0
    })
  },
  { $id: 'PriceResponse', additionalProperties: false }
)
// Main data model schema
export const cacheSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    ticker: Type.String({
      minLength: 1,
      maxLength: 10
    }),
    prices: Type.Array(PriceSchema, {
      minItems: 1
    })
  },
  { $id: 'Cache', additionalProperties: false }
)

export const cacheValidator = getValidator(cacheSchema, dataValidator)
export const cacheResolver = resolve({})

export const cacheExternalResolver = resolve({})

// Schema for creating new entries
export const cacheDataSchema = Type.Object(
  {
    ticker: Type.String({
      minLength: 1,
      maxLength: 10
    }),
    date: Type.String({
      pattern: '^\\d{4}-\\d{2}-\\d{2}$' // YYYY-MM-DD format
    }),
    closePrice: Type.Number({
      minimum: 0
    })
  },
  {
    $id: 'CacheData',
    additionalProperties: false
  }
)
export const cacheDataValidator = getValidator(cacheDataSchema, dataValidator)
export const cacheDataResolver = resolve({})

// Schema for updating existing entries
export const cachePatchSchema = Type.Partial(cacheSchema, {
  $id: 'CachePatch'
})
export const cachePatchValidator = getValidator(cachePatchSchema, dataValidator)
export const cachePatchResolver = resolve({})

// Schema for allowed query properties
export const cacheQueryProperties = Type.Pick(cacheSchema, ['ticker', 'date']) //consider add '_id'
export const cacheQuerySchema = Type.Intersect(
  [
    querySyntax(cacheQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: true }
)
export const cacheQueryValidator = getValidator(cacheQuerySchema, queryValidator)
export const cacheQueryResolver = resolve({})
