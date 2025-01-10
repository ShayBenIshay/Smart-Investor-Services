// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'
import type { AgentPortfolioService } from './agent-portfolio.class'

// Main data model schema
export const agentPortfolioSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    agentId: ObjectIdSchema(),
    cash: Type.Number(),
    createdAt: Type.Object({
      $date: Type.Object({
        $numberLong: Type.String()
      })
    }),
    updatedAt: Type.Object({
      $date: Type.Object({
        $numberLong: Type.String()
      })
    })
  },
  { $id: 'AgentPortfolio', additionalProperties: false }
)
export type AgentPortfolio = Static<typeof agentPortfolioSchema>
export const agentPortfolioValidator = getValidator(agentPortfolioSchema, dataValidator)
export const agentPortfolioResolver = resolve<AgentPortfolio, HookContext<AgentPortfolioService>>({})

export const agentPortfolioExternalResolver = resolve<AgentPortfolio, HookContext<AgentPortfolioService>>({})

// Schema for creating new entries
export const agentPortfolioDataSchema = Type.Pick(agentPortfolioSchema, ['cash', 'agentId'], {
  $id: 'AgentPortfolioData'
})
export type AgentPortfolioData = Static<typeof agentPortfolioDataSchema>
export const agentPortfolioDataValidator = getValidator(agentPortfolioDataSchema, dataValidator)
export const agentPortfolioDataResolver = resolve<AgentPortfolio, HookContext<AgentPortfolioService>>({
  createdAt: async () => {
    const now = new Date()
    return { $date: { $numberLong: now.getTime().toString() } }
  },
  updatedAt: async () => {
    const now = new Date()
    return { $date: { $numberLong: now.getTime().toString() } }
  }
})

// Schema for updating existing entries
export const agentPortfolioPatchSchema = Type.Partial(agentPortfolioSchema, {
  $id: 'AgentPortfolioPatch'
})
export type AgentPortfolioPatch = Static<typeof agentPortfolioPatchSchema>
export const agentPortfolioPatchValidator = getValidator(agentPortfolioPatchSchema, dataValidator)
export const agentPortfolioPatchResolver = resolve<AgentPortfolio, HookContext<AgentPortfolioService>>({})

// Schema for allowed query properties
export const agentPortfolioQueryProperties = Type.Pick(agentPortfolioSchema, ['_id', 'cash', 'agentId'])
export const agentPortfolioQuerySchema = Type.Intersect(
  [
    querySyntax(agentPortfolioQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false })
  ],
  { additionalProperties: false }
)
export type AgentPortfolioQuery = Static<typeof agentPortfolioQuerySchema>
export const agentPortfolioQueryValidator = getValidator(agentPortfolioQuerySchema, queryValidator)
export const agentPortfolioQueryResolver = resolve<AgentPortfolioQuery, HookContext<AgentPortfolioService>>(
  {}
)
