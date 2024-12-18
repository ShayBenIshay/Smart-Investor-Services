import enqueue from '../../throttle.js'

export class PolygonApiService {
  constructor(options) {
    this.options = options
  }

  async find(_params) {
    const { ticker, date, priority = 'system' } = _params.query
    if (!ticker || !date) {
      throw new Error('Both ticker and date are required.')
    }

    return enqueue(ticker, date, priority)
      .then((data) => [{ close: data?.close }])
      .catch((error) => {
        return undefined
      })
  }

  async get(id, _params) {
    return {
      id: 0,
      text: `A new message with ID: ${id}!`
    }
  }
  async create(data, params) {
    if (Array.isArray(data)) {
      return Promise.all(data.map((current) => this.create(current, params)))
    }

    return {
      id: 0,
      ...data
    }
  }

  // This method has to be added to the 'methods' option to make it available to clients
  async update(id, data, _params) {
    return {
      id: 0,
      ...data
    }
  }

  async patch(id, data, _params) {
    return {
      id: 0,
      text: `Fallback for ${id}`,
      ...data
    }
  }

  async remove(id, _params) {
    return {
      id: 0,
      text: 'removed'
    }
  }
}

export const getOptions = (app) => {
  return { app }
}
