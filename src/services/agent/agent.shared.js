// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
export const agentPath = 'agent'

export const agentMethods = ['find', 'get', 'create', 'patch', 'remove']

export const agentClient = (client) => {
  const connection = client.get('connection')

  client.use(agentPath, connection.service(agentPath), {
    methods: agentMethods
  })
}
