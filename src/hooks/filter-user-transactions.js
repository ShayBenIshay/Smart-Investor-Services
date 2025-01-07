import { ObjectId } from 'mongodb'

export const filterUserTransactions = async (context) => {
  const { params } = context

  // Ensure we have an authenticated user
  if (!params.user) {
    return context
  }

  // Add userId to the query to only return user's transactions
  params.query = {
    ...params.query,
    userId: new ObjectId(params.user._id)
  }

  return context
}
