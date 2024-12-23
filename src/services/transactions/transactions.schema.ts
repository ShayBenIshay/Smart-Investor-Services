import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { TransactionsService } from './transactions.class'

export const transactionsSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    userId: ObjectIdSchema(),
    agentId: ObjectIdSchema(),
    ticker: Type.String(),
    price: Type.Number(),
    executedAt: Type.String(),
    operation: Type.String(),
    papers: Type.Number(),
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
  { $id: 'Transactions', additionalProperties: false }
)
export type Transactions = Static<typeof transactionsSchema>
export const transactionsValidator = getValidator(transactionsSchema, dataValidator)
export const transactionsResolver = resolve<Transactions, HookContext<TransactionsService>>({
  userId: async (_value, _transaction, context) => {
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

export const transactionsExternalResolver = resolve<Transactions, HookContext<TransactionsService>>({})

export const transactionsDataSchema = Type.Pick(
  transactionsSchema,
  ['ticker', 'price', 'executedAt', 'operation', 'papers', 'agentId'],
  {
    $id: 'TransactionsData'
  }
)
export type TransactionsData = Static<typeof transactionsDataSchema>
export const transactionsDataValidator = getValidator(transactionsDataSchema, dataValidator)
export const transactionsDataResolver = resolve<Transactions, HookContext<TransactionsService>>({
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

export const transactionsPatchSchema = Type.Partial(transactionsSchema, {
  $id: 'TransactionsPatch'
})
export type TransactionsPatch = Static<typeof transactionsPatchSchema>
export const transactionsPatchValidator = getValidator(transactionsPatchSchema, dataValidator)
export const transactionsPatchResolver = resolve<Transactions, HookContext<TransactionsService>>({
  updatedAt: async () => {
    const now = new Date()
    return { $date: { $numberLong: now.getTime().toString() } }
  }
})

export const transactionsQueryProperties = Type.Pick(transactionsSchema, [
  '_id',
  'userId',
  'ticker',
  'price',
  'executedAt',
  'operation',
  'papers',
  'createdAt',
  'updatedAt'
])
export const transactionsQuerySchema = Type.Intersect(
  [querySyntax(transactionsQueryProperties), Type.Object({}, { additionalProperties: false })],
  { additionalProperties: false }
)
export type TransactionsQuery = Static<typeof transactionsQuerySchema>
export const transactionsQueryValidator = getValidator(transactionsQuerySchema, queryValidator)
export const transactionsQueryResolver = resolve<TransactionsQuery, HookContext<TransactionsService>>({})
