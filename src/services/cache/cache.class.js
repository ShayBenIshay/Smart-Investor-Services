import { MongoDBService } from '@feathersjs/mongodb'

export class CacheService extends MongoDBService {
  async find(params) {
    const { ticker, date } = params.query
    if (!ticker) return { message: 'Missing ticker query param' }
    const queryResponse = await super.find({
      query: {
        ticker
      }
    })
    if (queryResponse.data.length === 0) {
      return { message: `The ticker ${ticker} is not in cache` }
    }
    if (!date) {
      return queryResponse.data[0]
    }

    if (queryResponse.data.length > 0) {
      const document = queryResponse.data[0]
      const target = document.prices.find((price) => price.date === date)
      if (target) return target
    }
    return { message: `The date ${date} of ticker: ${ticker} is not in cache` }
  }

  async create(data, params) {
    const existing = await this.find({
      query: {
        ticker: data.ticker
      }
    })
    if (existing && !existing.message) {
      const flag = existing.prices?.some((price) => price.date === data.date)
      if (flag) {
        return existing
      }
      const updatedPricesArr = [...existing.prices, { date: data.date, closePrice: data.closePrice }]

      return this.patch(existing._id, { prices: updatedPricesArr })
    }

    const pricesArr = [{ date: data.date, closePrice: data.closePrice }]
    return super.create({ ticker: data.ticker, prices: pricesArr })
  }
}

export const getOptions = (app) => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('cache'))
  }
}
