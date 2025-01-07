// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import { MongoDBService } from '@feathersjs/mongodb'
import axios from 'axios'
import { response } from 'express'
import { ObjectId } from 'mongodb'
// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class AgentService extends MongoDBService {
  setup(app) {
    this.app = app
  }

  async create(params) {
    console.log('is it hereeee?')
    const { func, ...object } = params
    console.log(object)
    if (func === 'create') {
      return await super.create(object)
    }
    if (func === 'trades') {
      console.log('createee')
      console.log(object)
      return await this.makeTradeOrders(object)
    }
  }

  async find(params) {
    const query = params.query
    if (query.name === 'portfolio') {
      return await this.createPortfolio(query)
    }
    if (query.name === 'trade') {
      return await this.getTradeBoundries(query)
    }
    if (query.name === 'tweet') {
      return await this.Tweet(query)
    }
    if (query.name === 'find') {
      let response
      if (!query.userId) {
        response = await super.find({})
      } else {
        response = await super.find({
          query: {
            userId: new ObjectId(query.userId)
          }
        })
      }
      return response.data
    }
  }

  async makeTradeOrders({ agentId, orders }) {
    console.log(orders)
    console.log(agentId)
    console.log('executing the trades')
    const executedAt = new Date()
    orders.forEach(async (order) => {
      try {
        const transaction = {
          userId: agentId,
          ticker: order.ticker,
          price: parseFloat(order.buy),
          executedAt,
          operation: 'buy',
          papers: parseInt(order.papers, 10)
        }
        const transactioResponse = await this.app.service('transactions').create(transaction)
        console.log(transactioResponse)
      } catch (error) {
        console.log('failed to create a transaction ', order.ticker)
        return { message: 'Error creating Transactions' }
      }
    })
    return { userId: agentId, message: 'All transactions got executed' }
  }

  async createPortfolio(query) {
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

  async getTradeBoundries(query) {
    const { ticker, from_date, to_date, timespan } = query
    const throttleResponse = await this.app.service('throttle').find({
      query: {
        name: 'aggregate',
        ticker,
        from_date,
        to_date,
        timespan
      }
    })

    const url = `http://127.0.0.1:5000/trade`
    try {
      const response = await axios.get(url, {
        params: { ticker, from_date, to_date, timespan, history: throttleResponse }
      })
      return response.data
    } catch (error) {
      console.error('error occurred', error)
    }
  }

  async Tweet(query) {
    const { ticker, price, operation, papers } = query

    const url = `http://127.0.0.1:5000/tweet`
    try {
      const response = await axios.get(url, {
        params: { ticker, price, operation, papers }
      })
      return response.data
    } catch (error) {
      console.error('error occurred', error)
    }
  }
}

export const getOptions = (app) => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('agent'))
  }
}
