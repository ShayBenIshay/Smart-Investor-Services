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
      cash: 10000
    })
  } catch (error) {
    console.error('Failed to create portfolio:', error)
    throw error
  }

  return context
}
