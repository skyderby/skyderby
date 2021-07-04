import { useQuery, useQueryClient } from 'react-query'
import axios from 'axios'

import { preloadCompetitors } from './competitors'
import { preloadCategories } from './categories'
import { preloadRounds } from './rounds'
import { preloadResults } from 'api/hooks/speedSkydivingCompetitions/results'

const endpoint = eventId => `/api/v1/speed_skydiving_competitions/${eventId}/standings`

const getStandings = eventId => axios.get(endpoint(eventId))

const queryKey = eventId => ['speedSkydivingCompetitions', eventId, 'standings']

const buildQueryFn = (queryClient, options) => async ctx => {
  const [_key, eventId] = ctx.queryKey
  const { data } = await getStandings(eventId)

  const preload = Object.fromEntries((options.preload || []).map(key => [key, true]))

  await Promise.all(
    [
      preload.competitors && preloadCompetitors(eventId, queryClient),
      preload.categories && preloadCategories(eventId, queryClient),
      preload.rounds && preloadRounds(eventId, queryClient),
      preload.results && preloadResults(eventId, queryClient)
    ].filter(Boolean)
  )

  return data
}

export const standingsQuery = (eventId, queryClient, options) => ({
  queryKey: queryKey(eventId),
  queryFn: buildQueryFn(queryClient, options)
})

export const useStandingsQuery = (eventId, options) => {
  const queryClient = useQueryClient()

  return useQuery(standingsQuery(eventId, queryClient, options))
}
