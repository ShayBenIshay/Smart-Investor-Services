import { logger } from '../utils/logger'

export const ensurePortfolio = async (context) => {
  const user = context.result.user
  const accessToken = context.result.accessToken
  if (!user) {
    logger.error('No user found in authentication context')
    return context
  }

  const { app } = context
  const portfolioService = app.service('portfolio')

  try {
    // Check if user already has a portfolio
    const existingPortfolio = await portfolioService.find(
      {},
      {
        provider: 'rest',
        authentication: {
          strategy: 'jwt',
          accessToken
        }
      }
    )
    const exists = existingPortfolio.data.some((item) => item.userId.equals(user._id))
    if (!exists) {
      // Create new portfolio if none exists
      await portfolioService.create(
        { cash: 10000 },
        {
          provider: 'rest',
          authentication: {
            strategy: 'jwt',
            accessToken
          }
        }
      )
      logger.info(`Created portfolio for user: ${user._id}`)
    }
  } catch (error) {
    logger.error(`Failed to ensure portfolio for user ${user._id}: ${error.message}`)
  }

  return context
}
