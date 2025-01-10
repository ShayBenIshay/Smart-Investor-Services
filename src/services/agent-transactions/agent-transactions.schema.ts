// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { AgentTransactionsService } from './agent-transactions.class'

// Main data model schema
export const agentTransactionsSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    agentId: ObjectIdSchema(),
    ticker: Type.String(),
    price: Type.Number(),
    operation: Type.String({ enum: ['buy', 'sell'] }),
    papers: Type.Number(),
    executedAt: Type.String({ format: 'date-time' }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'AgentTransactions', additionalProperties: false }
)
export type AgentTransactions = Static<typeof agentTransactionsSchema>
export const agentTransactionsValidator = getValidator(agentTransactionsSchema, dataValidator)
export const agentTransactionsResolver = resolve<AgentTransactions, HookContext<AgentTransactionsService>>({})

export const agentTransactionsExternalResolver = resolve<
  AgentTransactions,
  HookContext<AgentTransactionsService>
>({})

// Schema for creating new entries
export const agentTransactionsDataSchema = Type.Pick(
  agentTransactionsSchema,
  ['operation', 'executedAt', 'price', 'papers', 'ticker', 'agentId'],
  { $id: 'AgentTransactionsData' }
)
export type AgentTransactionsData = Static<typeof agentTransactionsDataSchema>
export const agentTransactionsDataValidator = getValidator(agentTransactionsDataSchema, dataValidator)
export const agentTransactionsDataResolver = resolve<
  AgentTransactions,
  HookContext<AgentTransactionsService>
>({
  createdAt: async () => new Date().toISOString(),
  updatedAt: async () => new Date().toISOString()
})

// Schema for updating existing entries
export const agentTransactionsPatchSchema = Type.Partial(agentTransactionsSchema, {
  $id: 'AgentTransactionsPatch'
})
export type AgentTransactionsPatch = Static<typeof agentTransactionsPatchSchema>
export const agentTransactionsPatchValidator = getValidator(agentTransactionsPatchSchema, dataValidator)
export const agentTransactionsPatchResolver = resolve<
  AgentTransactions,
  HookContext<AgentTransactionsService>
>({})

// Schema for allowed query properties
export const agentTransactionsQueryProperties = Type.Pick(agentTransactionsSchema, [
  '_id',
  'ticker',
  'operation',
  'agentId'
])
export const agentTransactionsQuerySchema = Type.Intersect(
  [
    querySyntax(agentTransactionsQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type AgentTransactionsQuery = Static<typeof agentTransactionsQuerySchema>
export const agentTransactionsQueryValidator = getValidator(agentTransactionsQuerySchema, queryValidator)
export const agentTransactionsQueryResolver = resolve<
  AgentTransactionsQuery,
  HookContext<AgentTransactionsService>
>({})
