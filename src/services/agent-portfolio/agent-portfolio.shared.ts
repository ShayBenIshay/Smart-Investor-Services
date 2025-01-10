// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  AgentPortfolio,
  AgentPortfolioData,
  AgentPortfolioPatch,
  AgentPortfolioQuery,
  AgentPortfolioService
} from './agent-portfolio.class'

export type { AgentPortfolio, AgentPortfolioData, AgentPortfolioPatch, AgentPortfolioQuery }

export type AgentPortfolioClientService = Pick<
  AgentPortfolioService<Params<AgentPortfolioQuery>>,
  (typeof agentPortfolioMethods)[number]
>

export const agentPortfolioPath = 'agent-portfolio'

export const agentPortfolioMethods: Array<keyof AgentPortfolioService> = [
  'find',
  'get',
  'create',
  'patch',
  'remove'
]

export const agentPortfolioClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(agentPortfolioPath, connection.service(agentPortfolioPath), {
    methods: agentPortfolioMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [agentPortfolioPath]: AgentPortfolioClientService
  }
}
