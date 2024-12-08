import type { HookContext } from '../declarations'

export const createDocument = async (context: HookContext) => {
  console.log(`Created Document in DB ${context.path}: ${context.result}`)
}
