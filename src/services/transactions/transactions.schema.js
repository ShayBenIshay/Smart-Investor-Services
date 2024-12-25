import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'

import { dataValidator, queryValidator } from '../../validators'

export const transactionsSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    userId: ObjectIdSchema(),
    ticker: Type.String(),
    price: Type.Number(),
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
  { $id: 'Transactions' }
)
export const transactionsValidator = getValidator(transactionsSchema, dataValidator)
export const transactionsResolver = resolve({})

export const transactionsExternalResolver = resolve({})

export const transactionsDataSchema = Type.Pick(
  transactionsSchema,
  ['ticker', 'price', 'operation', 'papers', 'userId'],
  {
    $id: 'TransactionsData'
  }
)
export const transactionsDataValidator = getValidator(transactionsDataSchema, dataValidator)
export const transactionsDataResolver = resolve({
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
export const transactionsPatchValidator = getValidator(transactionsPatchSchema, dataValidator)
export const transactionsPatchResolver = resolve({
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
  'operation',
  'papers',
  'createdAt',
  'updatedAt'
])
export const transactionsQuerySchema = Type.Intersect([
  querySyntax(transactionsQueryProperties),
  Type.Object({})
])
export const transactionsQueryValidator = getValidator(transactionsQuerySchema, queryValidator)
export const transactionsQueryResolver = resolve({})
