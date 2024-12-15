import { portfolio } from './portfolio/portfolio'
import { transactions } from './transactions/transactions'
import { user } from './users/users'

import type { Application } from '../declarations'

export const services = (app: Application) => {
  app.configure(portfolio)
  app.configure(transactions)
  app.configure(user)
}
