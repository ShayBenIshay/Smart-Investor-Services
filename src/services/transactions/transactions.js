import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'
// import { filterByUser } from '../../hooks/filter-transactions'
import { createDocument } from '../../hooks/create-document'

import {
  transactionsDataValidator,
  transactionsPatchValidator,
  transactionsQueryValidator,
  transactionsResolver,
  transactionsExternalResolver,
  transactionsDataResolver,
  transactionsPatchResolver,
  transactionsQueryResolver
} from './transactions.schema'

import { TransactionsService, getOptions } from './transactions.class'
import { transactionsPath, transactionsMethods } from './transactions.shared'

export * from './transactions.class'
export * from './transactions.schema'

export const transactions = (app) => {
  app.use(transactionsPath, new TransactionsService(getOptions(app)), {
    methods: transactionsMethods,
    events: []
  })
  app.service(transactionsPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(transactionsExternalResolver),
        schemaHooks.resolveResult(transactionsResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(transactionsQueryValidator),
        schemaHooks.resolveQuery(transactionsQueryResolver)
      ],
      // find: [filterByUser],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(transactionsDataValidator),
        schemaHooks.resolveData(transactionsDataResolver)
      ],
      patch: [
        schemaHooks.validateData(transactionsPatchValidator),
        schemaHooks.resolveData(transactionsPatchResolver)
      ],
      remove: []
    },
    after: {
      create: [createDocument]
    },
    error: {
      all: []
    }
  })
}
