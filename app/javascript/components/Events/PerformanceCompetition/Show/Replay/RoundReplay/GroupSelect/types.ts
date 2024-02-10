import { Competitor, Result } from 'api/performanceCompetitions'
import { Profile } from 'api/profiles'

export type OptionType = { label: string; value: CompetitorRoundMapData }

export type CompetitorRoundMapData = Competitor & {
  result: Result
  profile: Profile
}
