export const polygonApiPath = 'polygon-api'

export const polygonApiMethods = ['find', 'get', 'create', 'patch', 'remove']

export const polygonApiClient = (client) => {
  const connection = client.get('connection')

  client.use(polygonApiPath, connection.service(polygonApiPath), {
    methods: polygonApiMethods
  })
}
