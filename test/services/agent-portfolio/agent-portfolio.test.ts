// For more information about this file see https://dove.feathersjs.com/guides/cli/service.test.html
import assert from 'assert'
import { app } from '../../../src/app'

describe('agent-portfolio service', () => {
  it('registered the service', () => {
    const service = app.service('agent-portfolio')

    assert.ok(service, 'Registered the service')
  })
})
