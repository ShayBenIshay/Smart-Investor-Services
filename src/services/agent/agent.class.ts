// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers'
import { MongoDBService } from '@feathersjs/mongodb'
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb'

import type { Application } from '../../declarations'
import type { Agent, AgentData, AgentPatch, AgentQuery } from './agent.schema'

export type { Agent, AgentData, AgentPatch, AgentQuery }

export interface AgentParams extends MongoDBAdapterParams<AgentQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class AgentService<ServiceParams extends Params = AgentParams> extends MongoDBService<
  Agent,
  AgentData,
  AgentParams,
  AgentPatch
> {}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('agent'))
  }
}
