import { app } from './app'
import { logger } from './utils/logger'

const port = app.get('port')
const host = app.get('host')

// process.on('unhandledRejection', (reason) => logger.error('Unhandled Rejection %O', reason))
process.on('unhandledRejection', (reason) => logger.error('Unhandled Rejection %O'))

app.listen(port).then(() => {
  logger.info(`Feathers app listening on http://${host}:${port}`)
})
