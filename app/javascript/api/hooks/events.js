import { useQuery, useQueryClient } from 'react-query'
import axios from 'axios'

import { preloadPlaces } from 'api/hooks/places'

const endpoint = '/api/v1/events'

const getEvents = async ({ page = 1, perPage = 7 }) => {
  const urlParams = new URLSearchParams()
  urlParams.set('page', page)
  urlParams.set('perPage', perPage)

  const { data } = await axios.get([endpoint, urlParams.toString()].join('?'))

  return data
}

const buildQueryFn = queryClient => async ctx => {
  const [_key, params] = ctx.queryKey
  const data = await getEvents(params)

  await preloadPlaces(data.items.map(event => event.placeId).filter(Boolean), queryClient)

  return data
}

export const useEventsQuery = params => {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ['events', params],
    queryFn: buildQueryFn(queryClient),
    keepPreviousData: true
  })
}
