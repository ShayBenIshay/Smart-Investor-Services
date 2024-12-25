import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'

import { dataValidator, queryValidator } from '../../validators'

export const portfolioSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    userId: ObjectIdSchema(),
    // agentId: ObjectIdSchema(),
    cash: Type.Number()
  },
  // { $id: 'Portfolio', additionalProperties: false }
  { $id: 'Portfolio' }
)
export const portfolioValidator = getValidator(portfolioSchema, dataValidator)
export const portfolioResolver = resolve({})

export const portfolioExternalResolver = resolve({})

// Schema for creating new entries
// export const portfolioDataSchema = Type.Pick(portfolioSchema, ['userId', 'agentId', 'cash'], {
export const portfolioDataSchema = Type.Pick(portfolioSchema, ['userId', 'cash'], {
  $id: 'PortfolioData'
})
export const portfolioDataValidator = getValidator(portfolioDataSchema, dataValidator)
export const portfolioDataResolver = resolve({})

// Schema for updating existing entries
export const portfolioPatchSchema = Type.Partial(portfolioSchema, {
  $id: 'PortfolioPatch'
})
export const portfolioPatchValidator = getValidator(portfolioPatchSchema, dataValidator)
export const portfolioPatchResolver = resolve({})

// Schema for allowed query properties
export const portfolioQueryProperties = Type.Pick(portfolioSchema, ['_id', 'userId'])
export const portfolioQuerySchema = Type.Intersect(
  [
    querySyntax(portfolioQueryProperties),
    // Add additional query properties here
    // Type.Object({}, { additionalProperties: false })
    Type.Object({})
  ]
  // { additionalProperties: false }
)
export const portfolioQueryValidator = getValidator(portfolioQuerySchema, queryValidator)
export const portfolioQueryResolver = resolve({})
