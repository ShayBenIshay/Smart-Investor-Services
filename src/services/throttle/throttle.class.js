// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import { MongoDBService } from '@feathersjs/mongodb'
import enqueue from '../../throttleClass.js'
import { logger } from '../../utils/logger'

export class ThrottleService extends MongoDBService {
  constructor(options) {
    super(options)
    this.requestStats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0
    }
  }

  validateParams(params, required) {
    const missing = required.filter((param) => !params[param])

    if (missing.length > 0) {
      logger.warn(`Missing required parameters: ${missing.join(', ')}`)
      return {
        isValid: false,
        message: `Missing required parameters: ${missing.join(', ')}`
      }
    }

    return { isValid: true }
  }

  async handleEnqueue(action, params, transformFn) {
    const requestId = `${action}_${Date.now()}`
    logger.info(`Starting ${action} request [${requestId}]:`, JSON.stringify(params))

    try {
      const data = await enqueue(action, params)
      logger.info(`Successfully completed ${action} [${requestId}]`)
      return transformFn ? transformFn(data) : data
    } catch (error) {
      logger.error(`${action} request failed [${requestId}]: ${error.message}`)
      return { message: `Unable to complete ${action} request` }
    }
  }

  async getCloseData(query) {
    const validation = this.validateParams(query, ['ticker', 'date'])
    if (!validation.isValid) {
      return { message: validation.message }
    }

    const { ticker, date, priority = 'system' } = query
    return await this.handleEnqueue('open-close', { ticker, date, priority }, (data) => [
      { close: data?.close }
    ])
  }

  async getLastCloseData(query) {
    const validation = this.validateParams(query, ['ticker'])
    if (!validation.isValid) {
      return { message: validation.message }
    }

    const { ticker, priority = 'system' } = query
    return await this.handleEnqueue('prev', { ticker, priority }, (data) => [{ close: data?.results[0]?.c }])
  }

  async getAggregateData(query) {
    const validation = this.validateParams(query, ['ticker', 'timespan', 'from_date', 'to_date'])
    if (!validation.isValid) {
      return { message: validation.message }
    }

    return await this.handleEnqueue('aggregate', query, (data) => data?.results || [])
  }

  async find(params) {
    this.requestStats.totalRequests++
    logger.info(`Processing find request with params: ${JSON.stringify(params.query)}`)

    try {
      const query = params.query
      let result

      switch (query.name) {
        case 'open-close':
          result = await this.getCloseData(query)
          break
        case 'prev':
          result = await this.getLastCloseData(query)
          break
        case 'aggregate':
          result = await this.getAggregateData(query)
          break
        case 'getStats':
          result = this.getStats()
          break
        default:
          logger.warn(`Unknown query name: ${query.name}`)
          this.requestStats.failedRequests++
          return { message: 'Invalid request type' }
      }

      if ('message' in result) {
        this.requestStats.failedRequests++
        return result
      }

      this.requestStats.successfulRequests++
      return result
    } catch (error) {
      this.requestStats.failedRequests++
      logger.error(`Unexpected error in find method: ${error.message}`)
      return { message: 'An unexpected error occurred' }
    }
  }

  getStats() {
    return this.requestStats
  }
}

export const getOptions = (app) => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('throttle'))
  }
}
