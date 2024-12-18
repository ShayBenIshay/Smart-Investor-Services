// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'

const PriceSchema = Type.Object(
  {
    date: Type.String(),
    closePrice: Type.Number()
  },
  { $id: 'PriceResponse', additionalProperties: false }
)
// Main data model schema
export const cacheSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    ticker: Type.String(),
    prices: Type.Array(PriceSchema)
  },
  { $id: 'Cache', additionalProperties: true }
)

export const cacheValidator = getValidator(cacheSchema, dataValidator)
export const cacheResolver = resolve({})

export const cacheExternalResolver = resolve({})

// Schema for creating new entries
export const cacheDataSchema = Type.Pick(cacheSchema, ['ticker', 'date', 'closePrice'], {
  $id: 'CacheData'
})
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
