import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { PortfolioService } from './portfolio.class'

export const portfolioSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    userId: ObjectIdSchema(),
    cash: Type.Number()
  },
  { $id: 'Portfolio', additionalProperties: false }
)
export type Portfolio = Static<typeof portfolioSchema>
export const portfolioValidator = getValidator(portfolioSchema, dataValidator)
export const portfolioResolver = resolve<Portfolio, HookContext<PortfolioService>>({})

export const portfolioExternalResolver = resolve<Portfolio, HookContext<PortfolioService>>({})

// Schema for creating new entries
export const portfolioDataSchema = Type.Pick(portfolioSchema, ['userId', 'cash'], {
  $id: 'PortfolioData'
})
export type PortfolioData = Static<typeof portfolioDataSchema>
export const portfolioDataValidator = getValidator(portfolioDataSchema, dataValidator)
export const portfolioDataResolver = resolve<Portfolio, HookContext<PortfolioService>>({})

// Schema for updating existing entries
export const portfolioPatchSchema = Type.Partial(portfolioSchema, {
  $id: 'PortfolioPatch'
})
export type PortfolioPatch = Static<typeof portfolioPatchSchema>
export const portfolioPatchValidator = getValidator(portfolioPatchSchema, dataValidator)
export const portfolioPatchResolver = resolve<Portfolio, HookContext<PortfolioService>>({})

// Schema for allowed query properties
export const portfolioQueryProperties = Type.Pick(portfolioSchema, ['_id', 'userId'])
export const portfolioQuerySchema = Type.Intersect(
  [
    querySyntax(portfolioQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type PortfolioQuery = Static<typeof portfolioQuerySchema>
export const portfolioQueryValidator = getValidator(portfolioQuerySchema, queryValidator)
export const portfolioQueryResolver = resolve<PortfolioQuery, HookContext<PortfolioService>>({})
