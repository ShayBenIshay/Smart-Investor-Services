import { ObjectId } from 'mongodb'

export const filterUserPortfolio = async (context) => {
  const { params } = context

  if (!params.user) {
    return context
  }
  params.query = {
    ...params.query,
    userId: new ObjectId(params.user._id)
  }

  return context
}
