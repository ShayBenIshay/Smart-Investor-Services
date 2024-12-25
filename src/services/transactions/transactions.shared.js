// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
export const transactionsPath = 'transactions'

export const transactionsMethods = ['find', 'get', 'create', 'patch', 'remove']

export const transactionsClient = (client) => {
  const connection = client.get('connection')

  client.use(transactionsPath, connection.service(transactionsPath), {
    methods: transactionsMethods
  })
}
