import { Id, NullableId, Params } from '@feathersjs/feathers'

export class HealthService {
  async find() {
    console.log('The service is running')
    return 'The service is running'
  }
}
