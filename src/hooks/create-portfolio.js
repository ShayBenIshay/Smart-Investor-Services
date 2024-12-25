import { PortfolioData } from '../services/portfolio/portfolio.schema'

export const createPortfolio = async (context) => {
  const { result, app } = context
  const portfolioService = app.service('portfolio')

  try {
    await portfolioService.create({
      userId: result._id,
      cash: 10000
    })
  } catch (error) {
    console.error('Failed to create portfolio:', error)
    throw error
  }

  return context
}

export const createAgentPortfolio = async (context) => {
  const { result, app, params } = context
  const portfolioService = app.service('portfolio')
  try {
    await portfolioService.create({
      userId: result._id,
      cash: params.cash
    })
  } catch (error) {
    console.error('Failed to create portfolio:', error)
    throw error
  }

  return context
}
