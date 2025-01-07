import { HookContext } from '@feathersjs/feathers'
import { BadRequest } from '@feathersjs/errors'

export const validateUniqueEmail = async (context: HookContext) => {
  const { data, app } = context

  // Skip if there's no email
  if (!data.email) {
    return context
  }

  const users = await app.service('users').find({
    query: {
      email: data.email
    }
  })

  if (users.total > 0) {
    throw new BadRequest('Email already exists')
  }

  return context
}
