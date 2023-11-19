import { AxiosResponse } from 'axios'
import { QueryFunction, useQuery } from '@tanstack/react-query'
import client from 'api/client'
import { cacheProfiles } from 'api/profiles'
import { cacheCountries } from 'api/countries'
import { queryKey, collectionUrl, deserialize } from './common'
import type { Organizer, IndexResponse, EventType, QueryKey } from './common'

const getOrganizers = (eventType: EventType, eventId: number) =>
  client
    .get<never, AxiosResponse<IndexResponse>>(collectionUrl(eventType, eventId))
    .then(response => response.data)

const queryFn: QueryFunction<Organizer[], QueryKey> = async ctx => {
  const [_key, eventType, eventId] = ctx.queryKey
  const data = await getOrganizers(eventType, eventId)

  cacheProfiles(data.relations.profiles)
  cacheCountries(data.relations.countries)

  return data.items.map(deserialize)
}

const organizersQuery = (eventType: EventType, eventId: number) => ({
  queryKey: queryKey(eventType, eventId),
  queryFn
})

const useOrganizersQuery = (eventType: EventType, eventId: number) =>
  useQuery(organizersQuery(eventType, eventId))

export default useOrganizersQuery
