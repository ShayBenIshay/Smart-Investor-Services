// For more information about this file see https://dove.feathersjs.com/guides/cli/hook.html
import type { HookContext } from '../declarations'

export const handleCash = async (context: HookContext) => {
  const { data } = context

  // Extract cash and remove it from the data
  if (data.cash !== undefined) {
    context.params.cash = Number(data.cash)
    delete data.cash
  } else {
    context.params.cash = 10000
  }

  return context
}
