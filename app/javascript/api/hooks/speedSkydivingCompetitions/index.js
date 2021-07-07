export {
  useSpeedSkydivingCompetitionQuery,
  useNewSpeedSkydivingCompetitionMutation,
  preloadSpeedSkydivingCompetition
} from './speedSkydivingCompetition'

export {
  useRoundsQuery,
  useRoundQuery,
  useNewRoundMutation,
  useDeleteRoundMutation,
  preloadRounds
} from './rounds'

export {
  useCategoriesQuery,
  useNewCategoryMutation,
  useEditCategoryMutation,
  useDeleteCategoryMutation,
  useChangePositionMutation,
  preloadCategories
} from './categories'

export {
  useCompetitorsQuery,
  useCompetitorQuery,
  useNewCompetitorMutation,
  useEditCompetitorMutation,
  useDeleteCompetitorMutation,
  preloadCompetitors
} from './competitors'

export {
  useResultsQuery,
  useResultQuery,
  useNewResultMutation,
  useEditResultMutation,
  useDeleteResultMutation,
  preloadResults
} from './results'

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
