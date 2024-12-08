import type { HookContext } from '../declarations'

// export const filterTransactions = async (context: HookContext) => {
//   console.log(`Running hook filter-transactions on ${context.path}.${context.method}`)
// }

export const filterByUser = async (context: HookContext) => {
  const { user } = context.params

  if (user) {
    context.params.query = {
      ...context.params.query,
      userId: user._id
    }
  }

  return context
}
