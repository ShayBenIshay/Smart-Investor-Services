// For more information about this file see https://dove.feathersjs.com/guides/cli/client.html
import { feathers } from '@feathersjs/feathers'
import type { TransportConnection, Application } from '@feathersjs/feathers'
import authenticationClient from '@feathersjs/authentication-client'
import type { AuthenticationClientOptions } from '@feathersjs/authentication-client'

import { agentClient } from './services/agent/agent.shared'
export type { Agent, AgentData, AgentQuery, AgentPatch } from './services/agent/agent.shared'

import { portfolioClient } from './services/portfolio/portfolio.shared'
import { cacheClient } from './services/cache/cache.shared.js'
import { polygonApiClient } from './services/polygon-api/polygon-api.shared'

export type {
  Portfolio,
  PortfolioData,
  PortfolioQuery,
  PortfolioPatch
} from './services/portfolio/portfolio.shared'

import { transactionsClient } from './services/transactions/transactions.shared'
export type {
  Transactions,
  TransactionsData,
  TransactionsQuery,
  TransactionsPatch
} from './services/transactions/transactions.shared'

import { userClient } from './services/users/users.shared'
export type { User, UserData, UserQuery, UserPatch } from './services/users/users.shared'

export interface Configuration {
  connection: TransportConnection<ServiceTypes>
}

export interface ServiceTypes {}

export type ClientApplication = Application<ServiceTypes, Configuration>

/**
 * Returns a typed client for the Smart-Investor-feathers app.
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
  client.configure(userClient)
  client.configure(transactionsClient)
  client.configure(portfolioClient)
  client.configure(cacheClient)
  client.configure(polygonApiClient)

  client.configure(agentClient)
  return client
}
