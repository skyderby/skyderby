import { useQuery, useQueryClient } from 'react-query'

import Api from 'api'
import { getQueryOptions as getProfileQueryOptions } from 'api/hooks/profiles'

const useCompetitorsQuery = eventId => {
  const queryClient = useQueryClient()

  return useQuery(['performanceCompetitions/competitors', { eventId }], async ctx => {
    const [_key, { eventId }] = ctx.queryKey
    const competitors = await Api.PerformanceCompetitions.Competitors.findAll(eventId)

    await Promise.all(
      competitors
        .map(el => el.profileId)
        .filter(Boolean)
        .map(id => queryClient.prefetchQuery(getProfileQueryOptions(id, queryClient)))
    )

    return competitors
  })
}

export default useCompetitorsQuery
