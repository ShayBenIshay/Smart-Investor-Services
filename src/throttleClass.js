import axios from 'axios'
import { logger } from './utils/logger.js'

class ThrottleClass {
  constructor(maxCallsPerMinute = 5) {
    if (ThrottleClass.instance) {
      return ThrottleClass.instance
    }
    ThrottleClass.instance = this

    this.maxCallsPerMinute = maxCallsPerMinute
    this.callQueue = []
    this.pendingRequests = new Map()
    this.callCount = 0
    this.isRunning = false

    this.startRateLimitTimer()
  }

  startRateLimitTimer() {
    setInterval(() => {
      this.resetRateLimit()
    }, 60000)
  }

  resetRateLimit() {
    logger.info(`Resetting rate limit. Queue size: ${this.callQueue.length}`)
    this.callCount = 0
    this.processQueue()
  }

  async makeRequest(url, params, requestKey) {
    try {
      const response = await axios.get(url, { params })
      return response.data
    } catch (error) {
      logger.error(`Request failed for ${requestKey}: ${error.message}`)
      throw error
    }
  }

  enqueue(name, params) {
    switch (name) {
      case 'open-close':
        return this.enqueueClose(params)
      case 'prev':
        return this.enqueueLastClose(params)
      case 'aggregate':
        return this.enqueueAggregate(params)
      default:
        logger.error(`Unknown request type: ${name}`)
        return Promise.reject(new Error(`Unknown request type: ${name}`))
    }
  }

  enqueueClose(params) {
    const { ticker, date, priority = 'system' } = params
    const requestKey = `${ticker}_${date}`

    return this.createRequest({
      requestKey,
      priority,
      apiCall: async () => {
        const apiKey = process.env.POLYGON_API_KEY
        const url = `https://api.polygon.io/v1/open-close/${ticker}/${date}`
        const response = await axios.get(url, { params: { apiKey } })
        console.log('Polygon open-close API Response:', { ticker, date, close: response.data?.close })
        return response.data
      }
    })
  }

  enqueueLastClose(params) {
    const { ticker, priority = 'system' } = params
    return new Promise((resolve, reject) => {
      const date = new Date().toISOString().split('T')[0]
      const requestKey = `${ticker}_${date}`

      if (this.pendingRequests.has(requestKey)) {
        console.log(`Duplicate request sharing promise: ${requestKey}`)
        return this.pendingRequests.get(requestKey).then(resolve).catch(reject)
      }

      const apiCall = async () => {
        const apiKey = process.env.POLYGON_API_KEY
        const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?adjusted=true`
        try {
          const response = await axios.get(url, {
            params: { apiKey }
          })
          const data = response.data
          const close = data.results[0].c
          console.log('Polygon Last close API Response:', { ticker, close })
          resolve(data)
        } catch (error) {
          reject(error)
        } finally {
          this.pendingRequests.delete(requestKey)
        }
      }

      const apiCallPromise = new Promise((apiResolve, apiReject) => {
        const callData = { apiCall, requestKey, priority, resolve: apiResolve, reject: apiReject }

        if (priority === 'user') {
          this.callQueue.unshift(callData)
        } else {
          this.callQueue.push(callData)
        }

        this.processQueue()
      })

      this.pendingRequests.set(requestKey, apiCallPromise)
    })
  }

  enqueueAggregate(params) {
    const {
      ticker,
      timespan,
      from_date,
      to_date,
      adjusted = 'true',
      sort = 'asc',
      priority = 'system'
    } = params

    return new Promise((resolve, reject) => {
      const requestKey = `${ticker}_${from_date}-${to_date}`

      if (this.pendingRequests.has(requestKey)) {
        logger.info(`Duplicate request sharing promise: ${requestKey}`)
        return this.pendingRequests.get(requestKey).then(resolve).catch(reject)
      }

      const apiCall = async () => {
        const apiKey = process.env.POLYGON_API_KEY
        const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/${timespan}/${from_date}/${to_date}?adjusted=${adjusted}&sort=${sort}`
        try {
          const response = await axios.get(url, {
            params: { apiKey }
          })
          const data = response.data
          const closeArray = data.results

          logger.info('Polygon Aggregate API Response:', {
            ticker,
            timespan,
            from_date,
            to_date,
            resultsCount: closeArray?.length
          })
          resolve(data)
        } catch (error) {
          reject(error)
        } finally {
          this.pendingRequests.delete(requestKey)
        }
      }

      const apiCallPromise = new Promise((apiResolve, apiReject) => {
        const callData = {
          apiCall,
          requestKey,
          priority,
          resolve: apiResolve,
          reject: apiReject
        }

        if (priority === 'user') {
          this.callQueue.unshift(callData)
        } else {
          this.callQueue.push(callData)
        }

        this.processQueue()
      })

      this.pendingRequests.set(requestKey, apiCallPromise)
    })
  }

  createRequest({ requestKey, priority, apiCall }) {
    logger.info('Creating request:', { requestKey, priority })

    return new Promise((resolve, reject) => {
      if (this.pendingRequests.has(requestKey)) {
        logger.info(`Reusing existing request: ${requestKey}`)
        return this.pendingRequests.get(requestKey).then(resolve).catch(reject)
      }

      const apiCallPromise = new Promise(async (apiResolve, apiReject) => {
        const callData = {
          apiCall: async () => {
            try {
              const result = await apiCall()
              resolve(result)
              apiResolve(result)
            } catch (error) {
              reject(error)
              apiReject(error)
            }
          },
          requestKey,
          priority,
          resolve: apiResolve,
          reject: apiReject
        }

        if (priority === 'user') {
          this.callQueue.unshift(callData)
        } else {
          this.callQueue.push(callData)
        }

        this.processQueue()
      })

      this.pendingRequests.set(requestKey, apiCallPromise)

      apiCallPromise.finally(() => {
        logger.info('Request completed, cleaning up:', { requestKey })
        this.pendingRequests.delete(requestKey)
      })
    })
  }

  async processQueue() {
    if (this.isRunning) return
    this.isRunning = true

    try {
      while (this.callQueue.length > 0 && this.callCount < this.maxCallsPerMinute) {
        const { apiCall, requestKey, resolve, reject } = this.callQueue.shift()

        this.callCount++
        try {
          const result = await apiCall()
          logger.info(`Queue processed result for ${requestKey}:`, { result })
          resolve(result)
        } catch (error) {
          logger.error(`API call failed for ${requestKey}:`, {
            error: error.message,
            stack: error.stack
          })
          reject(error)
        }
      }
    } finally {
      this.isRunning = false
    }
  }
}

const throttle = new ThrottleClass(5)
export default throttle.enqueue.bind(throttle)
