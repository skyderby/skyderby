export type { PerformanceCompetition, PerformanceCompetitionVariables } from './common'

export * from './categories'
export * from './competitors'
export * from './rounds'
export * from './results'
export * from './referencePoints'
export * from './teams'

export { default as usePerformanceCompetitionQuery } from './usePerformanceCompetitionQuery'
export { default as useCreatePerformanceCompetitionMutation } from './useCreatePerformanceCompetitionMutation'
export { default as useUpdatePerformanceCompetitionMutation } from './useUpdatePerformanceCompetitionMutation'
export { default as useStandingsQuery } from './useStandingsQuery'
export {
  default as useTeamStandingsQuery,
  teamStandingsQuery
} from './useTeamStandingsQuery'
export type { StandingRow, CategoryStandings } from './useStandingsQuery'
