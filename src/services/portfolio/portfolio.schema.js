import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { ObjectId } from 'mongodb'

import { dataValidator, queryValidator } from '../../validators'

export const portfolioSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    userId: ObjectIdSchema(),
    cash: Type.Number()
  },
  { $id: 'Portfolio', additionalProperties: false }
)

export const portfolioValidator = getValidator(portfolioSchema, dataValidator)
export const portfolioResolver = resolve({})

export const portfolioExternalResolver = resolve({})

export const portfolioDataSchema = Type.Pick(portfolioSchema, ['cash'], {
  $id: 'PortfolioData'
})
export const portfolioDataValidator = getValidator(portfolioDataSchema, dataValidator)
export const portfolioDataResolver = resolve({
  userId: async (_value, _data, context) => {
    if (!context.params.user) {
      throw new Error('User must be authenticated')
    }
    return new ObjectId(context.params.user._id)
  }
})

export const portfolioPatchSchema = Type.Partial(portfolioSchema, {
  $id: 'PortfolioPatch'
})
export const portfolioPatchValidator = getValidator(portfolioPatchSchema, dataValidator)
export const portfolioPatchResolver = resolve({})

export const portfolioQueryProperties = Type.Pick(portfolioSchema, ['_id', 'userId'])
export const portfolioQuerySchema = Type.Intersect(
  [
    querySyntax(portfolioQueryProperties),
    Type.Object(
      {
        name: Type.Optional(Type.String({ enum: ['calculate', 'find'] }))
      },
      { additionalProperties: false }
    )
  ],
  { additionalProperties: false }
)
export const portfolioQueryValidator = getValidator(portfolioQuerySchema, queryValidator)
export const portfolioQueryResolver = resolve({})
