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

  enqueueClose(ticker, date, priority = 'system') {
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
          console.log('API Response:', { ticker, date, close: data?.close })
          resolve(data)
        } catch (error) {
          reject(error)
        } finally {
          this.pendingRequests.delete(requestKey)
        }
      }

      const apiCallPromise = new Promise((apiResolve, apiReject) => {
        const callData = { apiCall, ticker, date, priority, resolve: apiResolve, reject: apiReject }

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
export default throttle.enqueueClose.bind(throttle)
