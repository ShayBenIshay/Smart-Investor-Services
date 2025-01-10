import { MongoDBService } from '@feathersjs/mongodb'
import { getLastTradingDate } from '../../utils'
import { BadRequest } from '@feathersjs/errors'
import { ObjectId } from 'mongodb'
import { logger } from '../../utils/logger'

export class PortfolioService extends MongoDBService {
  setup(app) {
    this.app = app
  }

  async find(params) {
    const { query } = params
    // If no name parameter, or name=find, just return the portfolio data
    if (!query.name || query.name === 'find') {
      return await super.find(params)
    }

    // Only calculate if explicitly requested
    if (query.name === 'calculate') {
      return await this.calculateTotals(params)
    }

    // Default fallback
    return await super.find(params)
  }

  async calculateTotals(params) {
    try {
      const { name, ...restParams } = params

      const newParams = {
        ...restParams,
        query: {
          userId: new ObjectId(restParams.query.userId)
        }
      }
      console.log('newParams', newParams)
      const portfolio = await super.find(newParams)

      logger.info(`Calculating totals for user ${restParams.query.userId}`)

      if (!portfolio.data || portfolio.data.length === 0) {
        logger.error('Portfolio not found')
        throw new BadRequest('Portfolio not found')
      }

      const cash = portfolio.data[0].cash
      const transactions = await this.app.service('transactions').find(newParams)
      const calcTotals = this._calculatePositions(transactions.data)
      // Filter out positions with zero shares
      Object.keys(calcTotals).forEach((ticker) => {
        if (calcTotals[ticker].position === 0) {
          delete calcTotals[ticker]
        }
      })
      await this._addCurrentPrices(calcTotals)

      const totalValue = this._calculateTotalValue(calcTotals, cash)
      this._calculatePercentages(calcTotals, totalValue)

      logger.info(`Calculated totals for user ${restParams.query.userId}: ${JSON.stringify(calcTotals)}`)
      return calcTotals
    } catch (error) {
      logger.error(error.message)
      throw new BadRequest(error.message)
    }
  }

  _calculatePositions(transactions) {
    return transactions.reduce((acc, transaction) => {
      const { ticker, price, papers, operation } = transaction

      if (!acc[ticker]) {
        acc[ticker] = {
          ticker,
          avgBuy: 0,
          totalSpent: 0,
          position: 0,
          unrealizedPL: 0,
          change: 0
        }
      }

      if (operation === 'buy') {
        acc[ticker].totalSpent += price * papers
        acc[ticker].position += papers
        acc[ticker].avgBuy = acc[ticker].totalSpent / acc[ticker].position
      } else if (operation === 'sell') {
        acc[ticker].position -= papers
        acc[ticker].totalSpent -= price * papers
        acc[ticker].avgBuy = acc[ticker].position > 0 ? acc[ticker].totalSpent / acc[ticker].position : 0
      }

      return acc
    }, {})
  }

  async _addCurrentPrices(calcTotals) {
    for (const ticker of Object.keys(calcTotals)) {
      try {
        const currentPrice = await this._getCurrentPrice(ticker)
        calcTotals[ticker].currentPrice = currentPrice
        calcTotals[ticker].change = currentPrice - calcTotals[ticker].avgBuy
        calcTotals[ticker].currentValue = currentPrice * calcTotals[ticker].position
        calcTotals[ticker].unrealizedPL = calcTotals[ticker].currentValue - calcTotals[ticker].totalSpent
      } catch (error) {
        console.log(`Failed to fetch price for ${ticker}:`, error.message)
        calcTotals[ticker].currentPrice = null
      }
    }
  }

  async _getCurrentPrice(ticker) {
    const date = getLastTradingDate()

    // Try to get price from cache
    try {
      const cacheResponse = await this.app.service('cache').find({
        query: { ticker, date }
      })
      if (cacheResponse.closePrice) {
        return cacheResponse.closePrice
      }
    } catch (error) {
      // Continue if cache miss
    }

    // Get price from throttle service
    const throttleResponse = await this.app.service('throttle').find({
      query: {
        name: 'prev',
        ticker,
        priority: 'user'
      }
    })
    const { close: closePrice } = throttleResponse[0]

    // Cache the result
    await this.app.service('cache').create({
      ticker,
      date,
      closePrice
    })

    return closePrice
  }

  _calculateTotalValue(calcTotals, cash) {
    return Object.values(calcTotals).reduce((total, stock) => total + (stock.currentValue || 0), cash)
  }

  _calculatePercentages(calcTotals, totalValue) {
    for (const ticker of Object.keys(calcTotals)) {
      calcTotals[ticker].percentage = (calcTotals[ticker].currentValue / totalValue) * 100
    }
  }
}

export const getOptions = (app) => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('portfolio'))
  }
}
