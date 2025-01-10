import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { ObjectId } from 'mongodb'

import { dataValidator, queryValidator } from '../../validators'

export const transactionsSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    userId: ObjectIdSchema(),
    agentId: Type.Optional(ObjectIdSchema()),
    ticker: Type.String(),
    price: Type.Number(),
    operation: Type.String({ enum: ['buy', 'sell'] }),
    papers: Type.Number(),
    executedAt: Type.String({ format: 'date-time' }),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' })
  },
  { $id: 'Transactions', additionalProperties: false }
)

export const transactionsValidator = getValidator(transactionsSchema, dataValidator)
export const transactionsResolver = resolve({})

export const transactionsExternalResolver = resolve({})

// Schema for creating new entries
export const transactionsDataSchema = Type.Pick(
  transactionsSchema,
  ['ticker', 'price', 'operation', 'papers', 'executedAt', 'agentId'],
  {
    $id: 'TransactionsData'
  }
)
export const transactionsDataValidator = getValidator(transactionsDataSchema, dataValidator)
export const transactionsDataResolver = resolve({
  createdAt: async () => new Date().toISOString(),
  updatedAt: async () => new Date().toISOString(),
  userId: async (_value, _data, context) => {
    // Get the authenticated user's ID from the context
    if (!context.params.user) {
      throw new Error('User must be authenticated')
    }
    return new ObjectId(context.params.user._id)
  },
  agentId: async (value) => {
    if (value) {
      return new ObjectId(value)
    }
    return undefined
  }
})

// Schema for updating existing entries
export const transactionsPatchSchema = Type.Partial(transactionsSchema, {
  $id: 'TransactionsPatch'
})
export const transactionsPatchValidator = getValidator(transactionsPatchSchema, dataValidator)
export const transactionsPatchResolver = resolve({
  updatedAt: async () => new Date().toISOString()
})

// Schema for allowed query properties
export const transactionsQueryProperties = Type.Pick(transactionsSchema, [
  '_id',
  'userId',
  'ticker',
  'operation',
  'agentId'
])
export const transactionsQuerySchema = Type.Intersect(
  [
    querySyntax(transactionsQueryProperties),
    Type.Object(
      {
        agentId: Type.Optional(Type.String())
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export const transactionsQueryValidator = getValidator(transactionsQuerySchema, queryValidator)
export const transactionsQueryResolver = resolve({
  agentId: async (value) => {
    if (value) {
      return new ObjectId(value)
    }
    return undefined
  }
})
