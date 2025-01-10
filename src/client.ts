// For more information about this file see https://dove.feathersjs.com/guides/cli/client.html
import { feathers } from '@feathersjs/feathers'
import type { TransportConnection, Application } from '@feathersjs/feathers'
import authenticationClient from '@feathersjs/authentication-client'
import type { AuthenticationClientOptions } from '@feathersjs/authentication-client'

import { agentTransactionsClient } from './services/agent-transactions/agent-transactions.shared'
export type {
  AgentTransactions,
  AgentTransactionsData,
  AgentTransactionsQuery,
  AgentTransactionsPatch
} from './services/agent-transactions/agent-transactions.shared'

import { agentPortfolioClient } from './services/agent-portfolio/agent-portfolio.shared'
export type {
  AgentPortfolio,
  AgentPortfolioData,
  AgentPortfolioQuery,
  AgentPortfolioPatch
} from './services/agent-portfolio/agent-portfolio.shared'

import { throttleClient } from './services/throttle/throttle.shared.js'
import { agentClient } from './services/agent/agent.shared'

import { portfolioClient } from './services/portfolio/portfolio.shared'
import { cacheClient } from './services/cache/cache.shared.js'

import { transactionsClient } from './services/transactions/transactions.shared.js'

import { userClient } from './services/users/users.shared'
export type { User, UserData, UserQuery, UserPatch } from './services/users/users.shared'

export interface Configuration {
  connection: TransportConnection<ServiceTypes>
}

export interface ServiceTypes {}

export type ClientApplication = Application<ServiceTypes, Configuration>

/**
 * Returns a typed client for the Smart-Investor-services app.
 *
 * @param connection The REST or Socket.io Feathers client connection
 * @param authenticationOptions Additional settings for the authentication client
 * @see https://dove.feathersjs.com/api/client.html
 * @returns The Feathers client application
 */
export const createClient = <Configuration = any,>(
  connection: TransportConnection<ServiceTypes>,
  authenticationOptions: Partial<AuthenticationClientOptions> = {}
) => {
  const client: ClientApplication = feathers()

  client.configure(connection)
  client.configure(authenticationClient(authenticationOptions))
  client.set('connection', connection)

  client.configure(userClient)
  client.configure(transactionsClient)
  client.configure(portfolioClient)
  client.configure(cacheClient)

  client.configure(throttleClient)
  client.configure(agentClient)
  client.configure(agentPortfolioClient)
  client.configure(agentTransactionsClient)
  return client
}
