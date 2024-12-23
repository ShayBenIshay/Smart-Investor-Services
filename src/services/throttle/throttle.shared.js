// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html

export const throttlePath = 'throttle'

export const throttleMethods = ['find', 'get', 'create', 'patch', 'remove']

export const throttleClient = (client) => {
  const connection = client.get('connection')

  client.use(throttlePath, connection.service(throttlePath), {
    methods: throttleMethods
  })
}
