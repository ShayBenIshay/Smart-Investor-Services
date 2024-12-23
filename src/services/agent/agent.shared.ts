// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Agent, AgentData, AgentPatch, AgentQuery, AgentService } from './agent.class'

export type { Agent, AgentData, AgentPatch, AgentQuery }

export type AgentClientService = Pick<AgentService<Params<AgentQuery>>, (typeof agentMethods)[number]>

export const agentPath = 'agent'

export const agentMethods: Array<keyof AgentService> = ['find', 'get', 'create', 'patch', 'remove']

export const agentClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(agentPath, connection.service(agentPath), {
    methods: agentMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [agentPath]: AgentClientService
  }
}
