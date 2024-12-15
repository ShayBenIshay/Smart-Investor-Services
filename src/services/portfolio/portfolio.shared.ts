import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type {
  Portfolio,
  PortfolioData,
  PortfolioPatch,
  PortfolioQuery,
  PortfolioService
} from './portfolio.class'

export type { Portfolio, PortfolioData, PortfolioPatch, PortfolioQuery }

export type PortfolioClientService = Pick<
  PortfolioService<Params<PortfolioQuery>>,
  (typeof portfolioMethods)[number]
>

export const portfolioPath = 'portfolio'

export const portfolioMethods: Array<keyof PortfolioService> = ['find', 'get', 'create', 'patch', 'remove']

export const portfolioClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(portfolioPath, connection.service(portfolioPath), {
    methods: portfolioMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [portfolioPath]: PortfolioClientService
  }
}
