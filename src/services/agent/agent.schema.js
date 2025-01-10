// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax } from '@feathersjs/typebox'
import { ObjectIdSchema } from '@feathersjs/typebox'
import { logger } from '../../utils/logger'
import { dataValidator, queryValidator } from '../../validators'

// Main data model schema
export const agentSchema = Type.Object(
  {
    _id: ObjectIdSchema(),
    userId: Type.Optional(ObjectIdSchema()),
    name: Type.String(),
    cash: Type.Number(),
    multiplier: Type.Number(),
    timespan: Type.String(),
    preferences: Type.String(),
    updatedAt: Type.Object({
      $date: Type.Object({
        $numberLong: Type.String()
      })
    }),
    createdAt: Type.Object({
      $date: Type.Object({
        $numberLong: Type.String()
      })
    })
  },
  { $id: 'Agent' }
)
export const agentValidator = getValidator(agentSchema, dataValidator)
export const agentResolver = resolve({})

export const agentExternalResolver = resolve({})

// Create separate schemas for different functions
const agentCreateSchema = Type.Object({
  func: Type.Literal('agent'),
  name: Type.String(),
  multiplier: Type.Number(),
  timespan: Type.String(),
  preferences: Type.String(),
  cash: Type.Number()
})

const portfolioCreateSchema = Type.Object({
  func: Type.Literal('portfolio'),
  cash: Type.Number(),
  agentId: ObjectIdSchema()
})

// Add new schema for portfolio calculation
const portfolioItemSchema = Type.Object({
  percentage: Type.Number(),
  ticker: Type.String()
})

const calculatePortfolioSchema = Type.Object({
  func: Type.Literal('calculate'),
  cash: Type.Number(),
  portfolio: Type.Array(portfolioItemSchema)
})

// Add new schema for trade calculation
const tradeItemSchema = Type.Object({
  percentage: Type.Number(),
  ticker: Type.String(),
  cash: Type.Number()
})

const calculateTradesSchema = Type.Object({
  func: Type.Literal('calculate-trades'),
  portfolio: Type.Array(tradeItemSchema)
})

const orderItemSchema = Type.Object({
  percentage: Type.Number(),
  ticker: Type.String(),
  cash: Type.Number(),
  price: Type.Number(),
  papers: Type.Number()
})

const createTransactionsSchema = Type.Object({
  func: Type.Literal('create-transactions'),
  orders: Type.Array(orderItemSchema)
})

const positionSchema = Type.Object({
  ticker: Type.String(),
  avgBuy: Type.Number(),
  totalSpent: Type.Number(),
  position: Type.Number(),
  unrealizedPL: Type.Number(),
  change: Type.Number(),
  currentPrice: Type.Number(),
  currentValue: Type.Number()
})

const manipulatePortfolioSchema = Type.Object({
  func: Type.Literal('manipulate-portfolio'),
  cash: Type.Number(),
  additionalInfo: Type.String(),
  totals: Type.Record(Type.String(), positionSchema)
})

// Add new schema for portfolio changes
const portfolioChangesSchema = Type.Object({
  func: Type.Literal('portfolio-changes'),
  totalValue: Type.Number(),
  newPortfolio: Type.Array(portfolioItemSchema),
  oldTotals: Type.Record(Type.String(), positionSchema)
})

// Update the data schema to include all cases
export const agentDataSchema = Type.Union([
  agentCreateSchema,
  portfolioCreateSchema,
  calculatePortfolioSchema,
  calculateTradesSchema,
  createTransactionsSchema,
  portfolioChangesSchema,
  manipulatePortfolioSchema
])

export const agentDataValidator = getValidator(agentDataSchema, dataValidator)
export const agentDataResolver = resolve({
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
export const agentPatchSchema = Type.Partial(agentSchema, {
  $id: 'AgentPatch'
})
export const agentPatchValidator = getValidator(agentPatchSchema, dataValidator)
export const agentPatchResolver = resolve({})

// Schema for allowed query properties
export const agentQueryProperties = Type.Pick(agentSchema, [
  '_id',
  'name',
  'multiplier',
  'timespan',
  'preferences'
])

const calculateTotalsSchema = Type.Object({
  name: Type.Literal('calculate'),
  agentId: Type.String()
})

// Add new schema for portfolio changes
const newPortfolioItemSchema = Type.Object({
  percentage: Type.Number(),
  ticker: Type.String()
})

const calculatePortfolioChangesSchema = Type.Object({
  name: Type.Literal('portfolio-changes'),
  totalValue: Type.Number(),
  newPortfolio: Type.Array(newPortfolioItemSchema),
  oldTotals: Type.Record(Type.String(), positionSchema)
})

// Update the query schema
export const agentQuerySchema = Type.Intersect(
  [
    querySyntax(agentQueryProperties),
    Type.Object({
      name: Type.Optional(Type.String()),
      agentId: Type.Optional(Type.String()),
      func: Type.Optional(Type.String()),
      totalValue: Type.Optional(Type.Number()),
      newPortfolio: Type.Optional(Type.Array(newPortfolioItemSchema)),
      oldTotals: Type.Optional(Type.Record(Type.String(), positionSchema))
    })
  ],
  { additionalProperties: false }
)

export const agentQueryValidator = getValidator(agentQuerySchema, queryValidator)
export const agentQueryResolver = resolve({})
