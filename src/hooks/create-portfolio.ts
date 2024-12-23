import type { HookContext } from '../declarations'
import { PortfolioData } from '../services/portfolio/portfolio.schema'

export const createPortfolio = async (context: HookContext) => {
  const { result, app } = context
  const portfolioService = app.service('portfolio') as {
    create: (data: PortfolioData) => Promise<PortfolioData>
  }

  try {
    await portfolioService.create({
      userId: result._id,
      agentId: {},
      cash: 10000
    })
  } catch (error) {
    console.error('Failed to create portfolio:', error)
    throw error
  }

  return context
}

export const createAgentPortfolio = async (context: HookContext) => {
  const { result, app, params } = context
  console.log('result', result)
  console.log('params', params)
  const portfolioService = app.service('portfolio') as {
    create: (data: PortfolioData) => Promise<PortfolioData>
  }

  console.log('result', result)

  try {
    await portfolioService.create({
      userId: params.user._id,
      agentId: result._id,
      cash: params.cash
      // isAgent: true
    })
  } catch (error) {
    console.error('Failed to create portfolio:', error)
    throw error
  }

  return context
}
