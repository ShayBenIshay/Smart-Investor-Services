export const portfolioPath = 'portfolio'

export const portfolioMethods = ['find', 'get', 'create', 'patch', 'remove']

export const portfolioClient = (client) => {
  const connection = client.get('connection')

  client.use(portfolioPath, connection.service(portfolioPath), {
    methods: portfolioMethods
  })
}
