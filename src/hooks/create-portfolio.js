import { logger } from '../utils/logger'

export const createPortfolio = async (context) => {
  const user = context.result

  await context.app.service('portfolio').create({
    userId: user._id,
    cash: 0
  })

  return context
}

export const createAgentPortfolio = async (context) => {
  const { data, app } = context

  // Only proceed if this is an agent creation
  if (data.func === 'agent' && data.cash) {
    try {
      // Remove cash from the agent data
      const { cash, ...agentData } = data

      // Create the agent first (without cash)
      const agent = await context.service._create(agentData)

      // Then create the portfolio using the agent service
      await app.service('agent').create({
        func: 'portfolio',
        cash: cash,
        agentId: agent._id
      })

      // Return the created agent
      context.result = agent
    } catch (error) {
      logger.error('Failed to create agent portfolio:', error)
      throw error
    }
  }

  return context
}
