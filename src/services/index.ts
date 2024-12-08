import { transactions } from './transactions/transactions'
import { user } from './users/users'

import type { Application } from '../declarations'

export const services = (app: Application) => {
  app.configure(transactions)
  app.configure(user)
}
