import { MongoDBService } from '@feathersjs/mongodb'
import { NotFound, BadRequest } from '@feathersjs/errors'
import { logger } from '../../utils/logger.js'

export class CacheService extends MongoDBService {
  async find(params) {
    const { ticker, date } = params.query
    console.log('ticker', ticker)
    console.log('date', date)

    if (!ticker) {
      logger.error('Missing ticker query param')
      return { message: 'Missing ticker query param' }
    }

    const queryResponse = await super.find({
      query: { ticker }
    })

    if (queryResponse.data.length === 0) {
      logger.warn(`The ticker ${ticker} is not in cache`)
      return { message: `The ticker ${ticker} is not in cache` }
    }

    if (!date) {
      return queryResponse.data[0]
    }

    const document = queryResponse.data[0]
    const target = document.prices.find((price) => price.date === date)

    if (!target) {
      logger.warn(`The date ${date} of ticker: ${ticker} is not in cache`)
      return { message: `The date ${date} of ticker: ${ticker} is not in cache` }
    }

    return target
  }

  async create(data, params) {
    try {
      const existing = await this.find({
        query: { ticker: data.ticker }
      })

      if (existing && existing.message) {
        return existing // Return the error message if it exists
      }

      if (!existing) {
        const pricesArr = [{ date: data.date, closePrice: data.closePrice }]
        return super.create({ ticker: data.ticker, prices: pricesArr })
      }

      // If we get here, the ticker exists
      const priceExists = existing.prices?.some((price) => price.date === data.date)
      if (priceExists) {
        return existing
      }

      const updatedPrices = [
        ...existing.prices,
        {
          date: data.date,
          closePrice: data.closePrice
        }
      ]

      return this.patch(existing._id, { prices: updatedPrices })
    } catch (error) {
      logger.error(`Error in cache create: ${error.message}`)
      return { message: `Error in cache create: ${error.message}` }
    }
  }
}

export const getOptions = (app) => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('cache'))
  }
}
