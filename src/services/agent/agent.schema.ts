// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { AgentService } from './agent.class'

// Main data model schema
export const agentSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    userId: ObjectIdSchema(),
    name: Type.String(),
    multiplier: Type.Number(),
    timespan: Type.String(),
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
  { $id: 'Agent', additionalProperties: false }
)
export type Agent = Static<typeof agentSchema>
export const agentValidator = getValidator(agentSchema, dataValidator)
export const agentResolver = resolve<Agent, HookContext<AgentService>>({
  userId: async (_value, _agent, context) => {
    console.log(context.params.user?._id)
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

export const agentExternalResolver = resolve<Agent, HookContext<AgentService>>({})

// Schema for creating new entries
export const agentDataSchema = Type.Pick(agentSchema, ['name', 'multiplier', 'timespan'], {
  $id: 'AgentData'
})
export type AgentData = Static<typeof agentDataSchema>
export const agentDataValidator = getValidator(agentDataSchema, dataValidator)
export const agentDataResolver = resolve<Agent, HookContext<AgentService>>({
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
export type AgentPatch = Static<typeof agentPatchSchema>
export const agentPatchValidator = getValidator(agentPatchSchema, dataValidator)
export const agentPatchResolver = resolve<Agent, HookContext<AgentService>>({})

// Schema for allowed query properties
export const agentQueryProperties = Type.Pick(agentSchema, ['_id', 'userId'])
export const agentQuerySchema = Type.Intersect(
  [
    querySyntax(agentQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type AgentQuery = Static<typeof agentQuerySchema>
export const agentQueryValidator = getValidator(agentQuerySchema, queryValidator)
export const agentQueryResolver = resolve<AgentQuery, HookContext<AgentService>>({})
