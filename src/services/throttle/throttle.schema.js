// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'

import { dataValidator, queryValidator } from '../../validators'

// Main data model schema
export const throttleSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    text: Type.String()
  }
  // { $id: 'Throttle', additionalProperties: false }
)
export const throttleValidator = getValidator(throttleSchema, dataValidator)
export const throttleResolver = resolve({})

export const throttleExternalResolver = resolve({})

// Schema for creating new entries
export const throttleDataSchema = Type.Pick(throttleSchema, ['text'], {
  $id: 'ThrottleData'
})
export const throttleDataValidator = getValidator(throttleDataSchema, dataValidator)
export const throttleDataResolver = resolve({})

// Schema for updating existing entries
export const throttlePatchSchema = Type.Partial(throttleSchema, {
  $id: 'ThrottlePatch'
})
export const throttlePatchValidator = getValidator(throttlePatchSchema, dataValidator)
export const throttlePatchResolver = resolve({})

// Schema for allowed query properties
export const throttleQueryProperties = Type.Pick(throttleSchema, ['_id', 'text'])
export const throttleQuerySchema = Type.Intersect(
  [
    querySyntax(throttleQueryProperties),
    // Add additional query properties here
    // Type.Object({}, { additionalProperties: false })
    Type.Object({})
  ]
  // { additionalProperties: false }
)
export const throttleQueryValidator = getValidator(throttleQuerySchema, queryValidator)
export const throttleQueryResolver = resolve({})
