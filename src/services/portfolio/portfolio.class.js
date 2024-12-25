import { MongoDBService } from '@feathersjs/mongodb'
import { getLastTradingDate } from '../../utils'

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class PortfolioService extends MongoDBService {
  setup(app) {
    this.app = app
  }

  async find(params) {
    console.log(params.query)
    const query = params.query
    if (query.name === 'calculate') {
      return await this.calculateTotals(query)
    }
    if (query.name === 'find') {
      return await super.find({
        query: {
          userId: query.userId
        }
      })
    }
  }

  async calculateTotals(query) {
    const { userId } = query
    const transactions = await this.app.service('transactions').find({
      query: {
        userId
      }
    })
    const portfolio = await super.find({
      query: {
        userId
      }
    })
    const cash = portfolio.data[0].cash

    const calcTotals = transactions.reduce((acc, transaction) => {
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

    console.log(calcTotals)

    let totalValue = cash

    for (const ticker of Object.keys(calcTotals)) {
      try {
        const date = getLastTradingDate()
        let currentPrice
        try {
          const queryResponse = await this.app.service('cache').find({
            query: { ticker, date }
          })
          currentPrice = queryResponse.closePrice || null
        } catch (error) {
          currentPrice = null
        }
        if (!currentPrice) {
          const queryResponse = await this.app.service('throttle').find({
            query: {
              name: 'prev',
              ticker,
              priority: 'user'
            }
          })
          const { close: closePrice } = queryResponse[0]

          await this.app.service('cache').create({
            ticker,
            date,
            closePrice
          })
          currentPrice = closePrice
        }
        calcTotals[ticker].currentPrice = currentPrice
        calcTotals[ticker].change = currentPrice - calcTotals[ticker].avgBuy
        calcTotals[ticker].currentValue = currentPrice * calcTotals[ticker].position
        totalValue += calcTotals[ticker].currentValue || 0
        calcTotals[ticker].unrealizedPL = calcTotals[ticker].currentValue - calcTotals[ticker].totalSpent
      } catch (error) {
        console.log(`Failed to fetch price for ${ticker}`)
        calcTotals[ticker].currentPrice = null
      }
    }

    for (const ticker of Object.keys(calcTotals)) {
      calcTotals[ticker].percentage = (calcTotals[ticker].currentValue / totalValue) * 100
    }
    return calcTotals
  }
}

export const getOptions = (app) => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('portfolio'))
  }
}
