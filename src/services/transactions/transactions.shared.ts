// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  Transactions,
  TransactionsData,
  TransactionsPatch,
  TransactionsQuery,
  TransactionsService
} from './transactions.class'

export type { Transactions, TransactionsData, TransactionsPatch, TransactionsQuery }

export type TransactionsClientService = Pick<
  TransactionsService<Params<TransactionsQuery>>,
  (typeof transactionsMethods)[number]
>

export const transactionsPath = 'transactions'

export const transactionsMethods: Array<keyof TransactionsService> = [
  'find',
  'get',
  'create',
  'patch',
  'remove'
]

export const transactionsClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(transactionsPath, connection.service(transactionsPath), {
    methods: transactionsMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [transactionsPath]: TransactionsClientService
  }
}
