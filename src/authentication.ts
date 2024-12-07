// For more information about this file see https://dove.feathersjs.com/guides/cli/authentication.html
import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication'
import { LocalStrategy } from '@feathersjs/authentication-local'
import { oauth, OAuthStrategy } from '@feathersjs/authentication-oauth'
import { Params } from '@feathersjs/feathers'

import type { Application } from './declarations'

declare module './declarations' {
  interface ServiceTypes {
    authentication: AuthenticationService
  }
}

interface GitHubProfile {
  avatar_url: string
  email: string // Email might not always be available
  [key: string]: any // To handle additional properties in the GitHub profile
}

interface BaseData {
  [key: string]: any // Adjust this based on your app's base data structure
}

class GitHubStrategy extends OAuthStrategy {
  async getEntityData(profile: GitHubProfile, existing: BaseData | null, params: Params) {
    const baseData = await super.getEntityData(profile, existing, params)

    return {
      ...baseData,
      // The GitHub profile image
      avatar: profile.avatar_url,
      // The user email address (if available)
      email: profile.email
    }
  }
}

export const authentication = (app: Application) => {
  const authentication = new AuthenticationService(app)

  authentication.register('jwt', new JWTStrategy())
  authentication.register('local', new LocalStrategy())
  authentication.register('google', new OAuthStrategy())
  authentication.register('github', new OAuthStrategy())

  app.use('authentication', authentication)
  app.configure(oauth())
}
