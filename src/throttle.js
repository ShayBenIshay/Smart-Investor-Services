import axios from 'axios'

class Throttle {
  constructor(maxCallsPerMinute) {
    if (this.instance) return this.instance
    this.instance = this

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
    console.log('Resetting rate limit...')
    console.log('calls awaiting', this.callQueue.length)
    this.callCount = 0
    this.processQueue()
  }

  enqueue(name, params) {
    if (name === 'open-close') {
      return this.enqueueClose(params)
    }
    if (name === 'prev') {
      return this.enqueueLastClose(params)
    }
    if (name === 'aggregate') {
      return this.enqueueAggregate(params)
    }
  }

  enqueueClose(params) {
    const { ticker, date, priority = 'system' } = params
    return new Promise((resolve, reject) => {
      const requestKey = `${ticker}_${date}`

      if (this.pendingRequests.has(requestKey)) {
        console.log(`Duplicate request sharing promise: ${requestKey}`)
        return this.pendingRequests.get(requestKey).then(resolve).catch(reject)
      }

      const apiCall = async () => {
        const apiKey = process.env.POLYGON_API_KEY
        const url = `https://api.polygon.io/v1/open-close/${ticker}/${date}`
        try {
          const response = await axios.get(url, {
            params: { apiKey }
          })

          const data = response.data
          console.log('/throttle open-close API Response:', { ticker, date, close: data?.close })
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
          console.log('/throttle last close API Response:', { ticker, close })
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
        console.log(`Duplicate request sharing promise: ${requestKey}`)
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

          // console.log('/throttle aggregate API Response:', { ticker, closeArray })
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

  async processQueue() {
    if (this.isRunning) return
    this.isRunning = true
    while (this.callQueue.length > 0 && this.callCount < this.maxCallsPerMinute) {
      const { apiCall } = this.callQueue.shift()

      this.callCount++
      await apiCall()
    }

    this.isRunning = false
  }
}

const throttle = new Throttle(5)
export default throttle.enqueue.bind(throttle)
