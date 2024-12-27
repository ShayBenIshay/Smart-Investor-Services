// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'

import { dataValidator, queryValidator } from '../../validators'

// Main data model schema
export const agentSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    userId: ObjectIdSchema(),
    name: Type.String(),
    multiplier: Type.Number(),
    timespan: Type.String(),
    preferences: Type.String(),
    updatedAt: Type.Object({
      $date: Type.Object({
        $numberLong: Type.String()
      })
    }),
    createdAt: Type.Object({
      $date: Type.Object({
        $numberLong: Type.String()
      })
    })
  },
  // { $id: 'Agent', additionalProperties: false }
  { $id: 'Agent' }
)
export const agentValidator = getValidator(agentSchema, dataValidator)
export const agentResolver = resolve({
  userId: async (_value, _agent, context) => {
    return context.params.user?._id
  },
  createdAt: async () => {
    const now = new Date()
    return { $date: { $numberLong: now.getTime().toString() } }
  },
  updatedAt: async () => {
    const now = new Date()
    return { $date: { $numberLong: now.getTime().toString() } }
  }
})

export const agentExternalResolver = resolve({})

// Schema for creating new entries
export const agentDataSchema = Type.Pick(agentSchema, ['name', 'multiplier', 'timespan', 'preferences'], {
  $id: 'AgentData'
})
export const agentDataValidator = getValidator(agentDataSchema, dataValidator)
export const agentDataResolver = resolve({
  userId: async (_value, _transaction, context) => {
    return context?.params?.user?._id
  },
  createdAt: async () => {
    const now = new Date()
    return { $date: { $numberLong: now.getTime().toString() } }
  },
  updatedAt: async () => {
    const now = new Date()
    return { $date: { $numberLong: now.getTime().toString() } }
  }
})

// Schema for updating existing entries
export const agentPatchSchema = Type.Partial(agentSchema, {
  $id: 'AgentPatch'
})
export const agentPatchValidator = getValidator(agentPatchSchema, dataValidator)
export const agentPatchResolver = resolve({})

// Schema for allowed query properties
export const agentQueryProperties = Type.Pick(agentSchema, [
  '_id',
  'name',
  'multiplier',
  'timespan',
  'preferences',
  'userId',
  'agentId',
  'orders'
])
export const agentQuerySchema = Type.Intersect(
  [
    querySyntax(agentQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
    // Type.Object({})
  ],
  { additionalProperties: false }
)
export const agentQueryValidator = getValidator(agentQuerySchema, queryValidator)
export const agentQueryResolver = resolve({})
