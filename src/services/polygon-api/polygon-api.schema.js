// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { dataValidator, queryValidator } from '../../validators.js'

// Main data model schema
export const polygonApiSchema = Type.Object(
  {
    id: Type.Number(),
    text: Type.String()
  },
  { $id: 'PolygonApi', additionalProperties: false }
)
export const polygonApiValidator = getValidator(polygonApiSchema, dataValidator)
export const polygonApiResolver = resolve({})

export const polygonApiExternalResolver = resolve({})

// Schema for creating new entries
export const polygonApiDataSchema = Type.Pick(polygonApiSchema, ['text'], {
  $id: 'PolygonApiData'
})
export const polygonApiDataValidator = getValidator(polygonApiDataSchema, dataValidator)
export const polygonApiDataResolver = resolve({})

// Schema for updating existing entries
export const polygonApiPatchSchema = Type.Partial(polygonApiSchema, {
  $id: 'PolygonApiPatch'
})
export const polygonApiPatchValidator = getValidator(polygonApiPatchSchema, dataValidator)
export const polygonApiPatchResolver = resolve({})

// Schema for allowed query properties
export const polygonApiQueryProperties = Type.Pick(polygonApiSchema, ['id', 'text'])
export const polygonApiQuerySchema = Type.Intersect(
  [
    querySyntax(polygonApiQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export const polygonApiQueryValidator = getValidator(polygonApiQuerySchema, queryValidator)
export const polygonApiQueryResolver = resolve({})
