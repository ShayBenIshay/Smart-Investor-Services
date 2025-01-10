import { authenticate } from '@feathersjs/authentication'
import { hooks as schemaHooks } from '@feathersjs/schema'

import { logCreateDocument } from '../../hooks/log-create-document.js'
import { filterUserTransactions } from '../../hooks/filter-user-transactions.js'

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
      find: [filterUserTransactions],
      get: [filterUserTransactions],
      create: [
        schemaHooks.validateData(transactionsDataValidator),
        schemaHooks.resolveData(transactionsDataResolver)
      ],
      patch: [
        schemaHooks.validateData(transactionsPatchValidator),
        schemaHooks.resolveData(transactionsPatchResolver)
      ],
      remove: [filterUserTransactions]
    },
    after: {
      create: [logCreateDocument]
    },
    error: {
      all: []
    }
  })
}
