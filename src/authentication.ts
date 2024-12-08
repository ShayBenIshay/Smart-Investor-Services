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
  email: string
  [key: string]: any
}

interface BaseData {
  [key: string]: any
}

class GitHubStrategy extends OAuthStrategy {
  async getEntityData(profile: GitHubProfile, existing: BaseData | null, params: Params) {
    const baseData = await super.getEntityData(profile, existing, params)

    return {
      ...baseData,
      avatar: profile.avatar_url,
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
