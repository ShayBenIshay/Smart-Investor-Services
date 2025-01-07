// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import { MongoDBService } from '@feathersjs/mongodb'
import { BadRequest } from '@feathersjs/errors'
import { ObjectId } from 'mongodb'
import { logger } from '../../utils/logger'

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class TransactionsService extends MongoDBService {
  setup(app) {
    this.app = app
  }

  async create(data, params) {
    // Ensure the user is authenticated
    if (!params.user) {
      logger.error('User must be authenticated')
      throw new BadRequest('User must be authenticated')
    }

    const userId = new ObjectId(params.user._id)
    const portfolioService = this.app.service('portfolio')

    // Calculate the amount to update based on the operation
    const amount = data.price * data.papers

    // Fetch the user's portfolio
    const portfolio = await portfolioService.find({
      query: { userId }
    })

    if (!portfolio.data || portfolio.data.length === 0) {
      logger.error('Portfolio not found')
      throw new BadRequest('Portfolio not found')
    }

    const currentCash = portfolio.data[0].cash

    // Update cash based on the operation
    if (data.operation === 'buy') {
      if (currentCash < amount) {
        logger.error('Insufficient cash to complete the purchase')
        throw new BadRequest('Insufficient cash to complete the purchase')
      }
      // Subtract from cash for buy operation
      await portfolioService.patch(portfolio.data[0]._id, {
        cash: currentCash - amount
      })
      logger.info(`User ${userId} bought ${data.papers} shares of ${data.ticker} for ${amount}`)
    } else if (data.operation === 'sell') {
      // Add to cash for sell operation
      await portfolioService.patch(portfolio.data[0]._id, {
        cash: currentCash + amount
      })
      logger.info(`User ${userId} sold ${data.papers} shares of ${data.ticker} for ${amount}`)
    }

    // Proceed to create the transaction
    return super.create(data, params)
  }
}

export const getOptions = (app) => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('transactions'))
  }
}
