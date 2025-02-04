import { HealthService } from './health.class'

export const health = (app) => {
  app.use('health', new HealthService())
}
