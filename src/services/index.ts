import { throttle } from './throttle/throttle'
import { agent } from './agent/agent'
import { portfolio } from './portfolio/portfolio'
import { transactions } from './transactions/transactions'
import { user } from './users/users'
import { cache } from './cache/cache'

import type { Application } from '../declarations'

export const services = (app: Application) => {
  app.configure(throttle)
  app.configure(agent)
  app.configure(portfolio)
  app.configure(transactions)
  app.configure(user)
  app.configure(cache)
}
