import { logger } from '../utils/logger'

export const logUserActions = (action) => {
  return async (context) => {
    const { method, params, data } = context

    switch (action) {
      case 'create':
        logger.info(`Creating user with email: ${data.email}`)
        break
      case 'update':
        logger.info(`Updating user with ID: ${context.id}`)
        break
      case 'remove':
        logger.info(`Removing user with ID: ${context.id}`)
        break
      default:
        break
    }

    return context
  }
}
