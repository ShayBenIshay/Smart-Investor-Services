// import { logger } from '../utils/logger'

// export const allowAgent = async (context) => {
//   const { params } = context
//   console.log('params', params)
//   // If there's no authentication but agentId is provided in query, allow access
//   if (!params.user && params.query?.agentId) {
//     logger.info(`Public access granted for agent: ${params.query.agentId}`)
//     return context
//   }

//   // If there's no authentication and no agentId, require authentication
//   if (!params.user) {
//     throw new Error('User must be authenticated')
//   }

//   return context
// }
