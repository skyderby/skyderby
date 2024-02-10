import { UseSuspenseQueryResult } from '@tanstack/react-query'

import useCompetitorsQuery from './useCompetitorsQuery'
import { Competitor } from './common'

export const useCompetitorQuery = (
  eventId: number,
  id: number
): UseSuspenseQueryResult<Competitor | undefined> =>
  useCompetitorsQuery<Competitor | undefined>(eventId, {
    select: data => data.find(competitor => competitor.id === id)
  })

export default useCompetitorQuery
