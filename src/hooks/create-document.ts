import type { HookContext } from '../declarations'

export const createDocument = async (context: HookContext) => {
  const { result } = context
  if (!result._id) {
    return context
  }
  console.log(`Created Document in DB ${context.path}: ${context.result}`)
}
