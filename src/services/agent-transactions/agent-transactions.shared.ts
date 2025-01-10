// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  AgentTransactions,
  AgentTransactionsData,
  AgentTransactionsPatch,
  AgentTransactionsQuery,
  AgentTransactionsService
} from './agent-transactions.class'

export type { AgentTransactions, AgentTransactionsData, AgentTransactionsPatch, AgentTransactionsQuery }

export type AgentTransactionsClientService = Pick<
  AgentTransactionsService<Params<AgentTransactionsQuery>>,
  (typeof agentTransactionsMethods)[number]
>

export const agentTransactionsPath = 'agent-transactions'

export const agentTransactionsMethods: Array<keyof AgentTransactionsService> = [
  'find',
  'get',
  'create',
  'patch',
  'remove'
]

export const agentTransactionsClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(agentTransactionsPath, connection.service(agentTransactionsPath), {
    methods: agentTransactionsMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [agentTransactionsPath]: AgentTransactionsClientService
  }
}
