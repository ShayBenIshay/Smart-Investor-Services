import type { HookContext } from '../declarations'

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
