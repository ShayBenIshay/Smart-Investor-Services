import { ObjectId } from 'mongodb'

export const filterUserTransactions = async (context) => {
  const { params } = context

  if (!params.user) {
    throw new Error('User must be authenticated')
  }

  // Start with userId filter
  const query = {
    ...params.query,
    userId: new ObjectId(params.user._id)
  }

  // If agentId is provided in query, add it to the filter
  if (params.query.agentId) {
    query.agentId = new ObjectId(params.query.agentId)
  }

  // Update the query in the context
  context.params.query = query

  return context
}
