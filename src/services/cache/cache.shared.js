export const cachePath = 'cache'

export const cacheMethods = ['find', 'get', 'create', 'patch', 'remove']

export const cacheClient = (client) => {
  const connection = client.get('connection')

  client.use(cachePath, connection.service(cachePath), {
    methods: cacheMethods
  })
}
