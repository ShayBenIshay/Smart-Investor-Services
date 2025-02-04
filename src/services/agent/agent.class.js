// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import { MongoDBService } from '@feathersjs/mongodb'
import axios from 'axios'
import { response } from 'express'
import { ObjectId } from 'mongodb'
import { logger } from '../../utils/logger'
import { getLastTradingDate } from '../../utils'
// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class AgentService extends MongoDBService {
  setup(app) {
    this.app = app
  }

  async create(params) {
    const { func, ...data } = params
    logger.info(`Creating agent with function: ${func}`)

    if (func === 'agent') {
      // Ensure all required fields are present
      const requiredFields = ['name', 'multiplier', 'timespan', 'preferences']
      for (const field of requiredFields) {
        if (!(field in data)) {
          throw new Error(`Missing required field: ${field}`)
        }
      }

      return await super.create(data)
    }

    if (func === 'trades') {
      logger.info('Processing trade orders')
      return await this.makeTradeOrders(data)
    }

    if (func === 'portfolio') {
      // Validate required fields for portfolio
      if (!data.cash || !data.agentId) {
        throw new Error('Missing required fields: cash and/or agentId')
      }
      // Create portfolio using the agent-portfolio service
      return await this.app.service('agent-portfolio').create({
        cash: data.cash,
        agentId: data.agentId
      })
    }

    if (func === 'calculate') {
      // Validate total percentage equals 100
      const totalPercentage = data.portfolio.reduce((sum, item) => sum + item.percentage, 0)
      if (totalPercentage !== 100) {
        throw new Error(`Total percentage must equal 100, got ${totalPercentage}`)
      }

      // Calculate cash value for each position
      const calculatedPortfolio = data.portfolio.map((item) => ({
        ...item,
        cash: (item.percentage / 100) * data.cash
      }))

      logger.info('Calculated portfolio:', JSON.stringify(calculatedPortfolio, null, 2))
      return calculatedPortfolio
    }

    if (func === 'calculate-trades') {
      try {
        const orders = await Promise.all(
          data.portfolio.map(async (item) => {
            // Get current price for ticker
            const priceResponse = await this.app.service('throttle').find({
              query: {
                name: 'prev',
                ticker: item.ticker
              }
            })

            const price = priceResponse[0].close
            const papers = Math.floor(item.cash / price)

            return {
              ...item,
              price,
              papers
            }
          })
        )

        logger.info('Calculated trade orders:', JSON.stringify(orders, null, 2))
        return orders
      } catch (error) {
        logger.error('Failed to calculate trade orders:', error)
        throw error
      }
    }

    if (func === 'create-transactions') {
      try {
        const transactions = await Promise.all(
          data.orders.map(async (order) => {
            const transaction = {
              operation: 'buy',
              executedAt: new Date().toISOString(),
              price: order.price,
              papers: order.papers,
              ticker: order.ticker,
              agentId: data.agentId
            }

            logger.info(`Creating agenttransaction for ${order.ticker}`)
            return await this.app.service('agent-transactions').create(transaction)
          })
        )

        logger.info(`Created ${transactions.length} transactions`)
        return transactions
      } catch (error) {
        logger.error('Failed to create transactions:', error)
        throw error
      }
    }

    if (func === 'manipulate-portfolio') {
      try {
        const url = 'http://127.0.0.1:5000/manipulate-portfolio'
        logger.info('Calling manipulate-portfolio endpoint with data:', JSON.stringify(data, null, 2))

        const response = await axios.post(url, {
          cash: data.cash,
          additionalInfo: data.additionalInfo,
          totals: data.totals
        })

        logger.info('Received response from manipulate-portfolio:', JSON.stringify(response.data, null, 2))
        return response.data
      } catch (error) {
        logger.error('Failed to manipulate portfolio:', error)
        throw error
      }
    }

    if (func === 'portfolio-changes') {
      try {
        // Step 1: Calculate target positions using calculate
        const calculatedPositions = await this.create({
          func: 'calculate',
          cash: data.totalValue,
          portfolio: data.newPortfolio
        })

        logger.info('Calculated target positions:', JSON.stringify(calculatedPositions, null, 2))

        // Step 2: Get current prices using calculate-trades
        const positionsWithPrices = await this.create({
          func: 'calculate-trades',
          portfolio: calculatedPositions
        })

        logger.info('Positions with prices:', JSON.stringify(positionsWithPrices, null, 2))

        // Step 3: Calculate differences
        const changes = this._calculatePositionChanges(positionsWithPrices, data.oldTotals)

        logger.info('Calculated position changes:', JSON.stringify(changes, null, 2))
        return changes
      } catch (error) {
        logger.error('Failed to calculate portfolio changes:', error)
        throw error
      }
    }
  }

  async find(params) {
    logger.info('Agent find method called with params:', params)
    const query = params.query || {}
    console.log(query.name)
    if (query.name === 'portfolio-changes') {
      try {
        // Step 1: Calculate target positions using calculate
        const calculatedPositions = await this.create({
          func: 'calculate',
          cash: query.totalValue,
          portfolio: query.newPortfolio
        })

        logger.info('Calculated target positions:', JSON.stringify(calculatedPositions, null, 2))

        // Step 2: Get current prices using calculate-trades
        const positionsWithPrices = await this.create({
          func: 'calculate-trades',
          portfolio: calculatedPositions
        })

        logger.info('Positions with prices:', JSON.stringify(positionsWithPrices, null, 2))

        // Step 3: Calculate differences
        const changes = this._calculatePositionChanges(positionsWithPrices, query.oldTotals)

        logger.info('Calculated position changes:', JSON.stringify(changes, null, 2))
        return changes
      } catch (error) {
        logger.error('Failed to calculate portfolio changes:', error)
        throw error
      }
    }

    if (query.name === 'calculate' && query.agentId) {
      try {
        // Get all transactions for this agent
        const transactions = await this.app.service('agent-transactions').find({
          query: {
            agentId: new ObjectId(query.agentId)
          }
        })

        logger.info(`Found ${transactions.data.length} transactions for agent ${query.agentId}`)

        // Calculate totals
        const calcTotals = this._calculatePositions(transactions.data)

        // Filter out positions with zero shares
        Object.keys(calcTotals).forEach((ticker) => {
          if (calcTotals[ticker].position === 0) {
            delete calcTotals[ticker]
          }
        })

        // Get current prices and calculate values
        await this._addCurrentPrices(calcTotals)

        // Calculate total portfolio value
        const totalValue = Object.values(calcTotals).reduce((sum, position) => {
          return sum + position.currentValue
        }, 0)

        // Add percentage to each position
        Object.values(calcTotals).forEach((position) => {
          position.percentage = Number(((position.currentValue / totalValue) * 100).toFixed(2))
        })

        logger.info(`Calculated totals for agent ${query.agentId}:`, JSON.stringify(calcTotals, null, 2))

        // Return the new format with totalValue and totals
        return {
          totalValue,
          totals: calcTotals
        }
      } catch (error) {
        logger.error(`Error calculating totals for agent ${query.agentId}:`, error)
        throw error
      }
    }

    // Handle the build function case
    if (query.func === 'build' && query.agentId) {
      try {
        // Convert string ID to ObjectId
        const agent = await super.get(new ObjectId(query.agentId))
        logger.info('Found agent:', JSON.stringify(agent))

        const portfolio = await this.app.service('agent-portfolio').find({
          query: {
            agentId: new ObjectId(query.agentId)
          }
        })
        logger.info('Found portfolio:', JSON.stringify(portfolio))

        const url = `http://127.0.0.1:5000/portfolio`
        try {
          const response = await axios.get(url, {
            params: { userPreference: agent.preferences }
          })
          return { agent, portfolio, data: response.data }
        } catch (error) {
          logger.error('Failed to connect to Python service:', error.message)

          // Check if it's a connection refused error
          if (error.code === 'ECONNREFUSED') {
            throw new Error(
              'Python service is not available. Please ensure the service is running on port 5000.'
            )
          }

          // For other types of errors
          throw new Error(`Failed to get portfolio from Python service: ${error.message}`)
        }
      } catch (error) {
        logger.error('Error in build function:', error)
        throw error
      }
    }

    // For regular find requests, return all agents
    return super.find(params)
  }

  async get(id, params) {
    logger.info(`Getting agent with id: ${id}`)
    return super.get(id, params)
  }

  async buildPortfolio(query) {
    const { userId, agentId } = query
    const portfolioResponse = await this.app.service('portfolio').find({
      query: {
        userId
      }
    })

    const targetAgent = new ObjectId(agentId)
    const matchingItem = portfolioResponse.data.find((portfolio) => portfolio.agentId.equals(targetAgent))

    const cash = matchingItem.cash

    const url = `http://127.0.0.1:5000/portfolio`
    try {
      const response = await axios.get(url, {
        params: { cash }
      })
      return response.data
    } catch (error) {
      console.error('error occurred', error)
    }
  }

  async makeTradeOrders(data) {
    try {
      const orders = await Promise.all(
        data.portfolio.map(async (item) => {
          // Get current price for ticker
          const priceResponse = await this.app.service('throttle').find({
            query: {
              name: 'prev',
              ticker: item.ticker
            }
          })

          const price = priceResponse[0].close
          const papers = Math.floor(item.cash / price)

          return {
            ...item,
            buy: price,
            papers
          }
        })
      )

      logger.info('Calculated orders:', JSON.stringify(orders, null, 2))
      return orders
    } catch (error) {
      logger.error('Failed to process trade orders:', error)
      throw error
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
    logger.info(`Starting to fetch prices for ${Object.keys(calcTotals).length} tickers`)
    const startTime = Date.now()

    for (const ticker of Object.keys(calcTotals)) {
      const tickerStartTime = Date.now()
      try {
        const currentPrice = await this._getCurrentPrice(ticker)
        if (currentPrice !== null) {
          this._updatePositionWithPrice(calcTotals[ticker], currentPrice)
        }
        logger.info(`Processed ${ticker} in ${Date.now() - tickerStartTime}ms`)
      } catch (error) {
        logger.error(`Failed to fetch price for ${ticker} after ${Date.now() - tickerStartTime}ms:`, error)
        calcTotals[ticker].currentPrice = null
      }
    }

    logger.info(`Completed all price fetches in ${Date.now() - startTime}ms`)
  }

  async _getCurrentPrice(ticker) {
    const date = getLastTradingDate()
    const startTime = Date.now()

    // Try cache first
    try {
      logger.info(`Attempting to fetch ${ticker} price from cache for date ${date}`)
      const cacheResponse = await this.app.service('cache').find({
        query: { ticker, date }
      })

      // The response is already in the format { date, closePrice }
      if (cacheResponse && cacheResponse.closePrice) {
        const price = cacheResponse.closePrice
        const timeSpent = Date.now() - startTime
        logger.info(`Cache HIT for ${ticker}: ${price} (took ${timeSpent}ms)`)
        return price
      }
      logger.info(`Cache MISS for ${ticker} (took ${Date.now() - startTime}ms)`)
    } catch (error) {
      logger.info(`Cache error for ${ticker}: ${error.message} (took ${Date.now() - startTime}ms)`)
    }

    // If we get here, try throttle service
    logger.info(`Fetching ${ticker} price from throttle service`)
    const throttleStartTime = Date.now()
    const priceResponse = await this.app.service('throttle').find({
      query: {
        name: 'prev',
        ticker
      }
    })
    logger.info(`Throttle service response for ${ticker} took ${Date.now() - throttleStartTime}ms`)

    const totalTime = Date.now() - startTime
    logger.info(`Total time to get price for ${ticker}: ${totalTime}ms`)
    return priceResponse.close
  }

  _updatePositionWithPrice(position, currentPrice) {
    position.currentPrice = currentPrice
    position.change = currentPrice - position.avgBuy
    position.currentValue = currentPrice * position.position
    position.unrealizedPL = position.currentValue - position.totalSpent
  }

  _calculatePositionChanges(newPositions, oldTotals) {
    const changes = []

    // Process each new position
    for (const newPos of newPositions) {
      const oldPosition = oldTotals[newPos.ticker]
      const currentPapers = oldPosition ? oldPosition.position : 0
      const targetPapers = newPos.papers
      const papersDiff = targetPapers - currentPapers

      changes.push({
        ticker: newPos.ticker,
        currentPosition: currentPapers,
        targetPosition: targetPapers,
        action: papersDiff > 0 ? 'buy' : papersDiff < 0 ? 'sell' : 'none',
        papers: Math.abs(papersDiff),
        price: newPos.price,
        cash: Math.abs(papersDiff * newPos.price)
      })
    }

    // Check for positions that need to be fully sold
    for (const ticker in oldTotals) {
      if (!newPositions.find((pos) => pos.ticker === ticker)) {
        changes.push({
          ticker,
          currentPosition: oldTotals[ticker].position,
          targetPosition: 0,
          action: 'sell',
          papers: oldTotals[ticker].position,
          price: oldTotals[ticker].currentPrice,
          cash: oldTotals[ticker].position * oldTotals[ticker].currentPrice
        })
      }
    }

    return changes
  }
}

//   if (query.name === 'trade') {
//     return await this.getTradeBoundries(query)
//   }
//   if (query.name === 'tweet') {
//     return await this.Tweet(query)
//   }

// async getTradeBoundries(query) {
//   const { ticker, from_date, to_date, timespan } = query
//   try {
//     const throttleResponse = await this.app.service('throttle').find({
//       query: {
//         name: 'aggregate',
//         ticker,
//         from_date,
//         to_date,
//         timespan
//       }
//     })

//     const url = `http://127.0.0.1:5000/trade`
//     const response = await axios.get(url, {
//       params: { ticker, from_date, to_date, timespan, history: throttleResponse }
//     })
//     return response.data
//   } catch (error) {
//     logger.error(`Error in getTradeBoundries: ${error.message}`)
//     throw new Error(`Failed to get trade boundaries: ${error.message}`)
//   }
// }

//   async Tweet(query) {
//     const { ticker, price, operation, papers } = query
//     const url = `http://127.0.0.1:5000/tweet`

//     try {
//       const response = await axios.get(url, {
//         params: { ticker, price, operation, papers }
//       })
//       return response.data
//     } catch (error) {
//       logger.error(`Error in Tweet function: ${error.message}`)
//       throw new Error(`Tweet operation failed: ${error.message}`)
//     }
//   }

export const getOptions = (app) => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('agent'))
  }
}
