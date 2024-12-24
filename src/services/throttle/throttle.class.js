// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import { MongoDBService } from '@feathersjs/mongodb'
import enqueue from '../../throttle.js'

export class ThrottleService extends MongoDBService {
  async find(params) {
    const query = params.query
    if (query.name === 'open-close') {
      return await this.getCloseData(query)
    }
    if (query.name === 'prev') {
      return await this.getLastCloseData(query)
    }

    if (query.name === 'aggregate') {
      return this.getAggregateData(query)
    }
  }

  async getCloseData(query) {
    const { ticker, date, priority = 'system' } = query

    if (!ticker || !date) {
      throw new Error('Both ticker and date are required.')
    }

    return await enqueue('open-close', { ticker, date, priority })
      .then((data) => [{ close: data?.close }])
      .catch((error) => {
        return undefined
      })
  }

  async getLastCloseData(query) {
    const { ticker, priority = 'system' } = query

    if (!ticker) {
      throw new Error('ticker is required.')
    }

    return await enqueue('prev', { ticker, priority })
      .then((data) => [{ close: data?.results[0].c }])
      .catch((error) => {
        return undefined
      })
  }

  async getAggregateData(query) {
    const { ticker, timespan, from_date, to_date } = query

    return {
      ticker,
      timespan,
      from_date,
      to_date,
      aggregatedPrice: 567.89
    }
  }
}

export const getOptions = (app) => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('throttle'))
  }
}
