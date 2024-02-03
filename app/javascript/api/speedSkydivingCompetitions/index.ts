export * from './results'
export * from './rounds'
export * from './categories'

export type {
  SpeedSkydivingCompetitionMutation,
  EventVariables
} from './speedSkydivingCompetition'

export type {
  SpeedSkydivingCompetition,
  Competitor,
  CompetitorStandingRow,
  CategoryStandings
} from './types'

export {
  useSpeedSkydivingCompetitionQuery,
  useNewSpeedSkydivingCompetitionMutation,
  useEditSpeedSkydivingCompetitionMutation,
  preloadSpeedSkydivingCompetition
} from './speedSkydivingCompetition'

export {
  useCompetitorsQuery,
  useCompetitorQuery,
  useNewCompetitorMutation,
  useEditCompetitorMutation,
  useDeleteCompetitorMutation,
  preloadCompetitors
} from './competitors'

export {
  useTeamsQuery,
  useTeamQuery,
  useNewTeamMutation,
  useEditTeamMutation,
  useDeleteTeamMutation,
  preloadTeams
} from './teams'

export { useStandingsQuery, preloadStandings } from './standings'

export { useTeamStandingsQuery, preloadTeamStandings } from './teamStandings'

export { useOpenStandingsQuery, preloadOpenStandings } from './openStandings'
