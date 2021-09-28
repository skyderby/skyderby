import axios, { AxiosError, AxiosResponse } from 'axios'
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryFunction,
  QueryClient,
  UseQueryOptions,
  UseQueryResult,
  UseMutationResult
} from 'react-query'
import { parseISO } from 'date-fns'

import { cacheProfiles } from 'api/hooks/profiles'
import { cacheCountries } from 'api/hooks/countries'
import { getCSRFToken } from 'utils/csrfToken'
import { standingsQuery } from './standings'
import { Competitor } from './types'

type SerializedCompetitor = {
  [K in keyof Competitor]: Competitor[K] extends Date ? string : Competitor[K]
}

type CreateVariables = {
  eventId: number
  profileId: number
  categoryId: number
  assignedNumber: number
  profileAttributes: {
    name: string
    countryId: number
  }
}

type UpdateVariables = CreateVariables & { id: number }

type DeleteVariables = {
  eventId: number
  id: number
}

type MutationOptions = {
  onSuccess?: (arg: Competitor) => unknown
}

type QueryKey = ['speedSkydivingCompetitions', number, 'competitors']

const deserialize = (competitor: SerializedCompetitor): Competitor => ({
  ...competitor,
  createdAt: parseISO(competitor.createdAt),
  updatedAt: parseISO(competitor.updatedAt)
})

const collectionEndpoint = (eventId: number) =>
  `/api/v1/speed_skydiving_competitions/${eventId}/competitors`
const elementEndpoint = (eventId: number, id: number) =>
  `${collectionEndpoint(eventId)}/${id}`

const getHeaders = () => ({ 'X-CSRF-Token': getCSRFToken() })

const getCompetitors = (eventId: number) =>
  axios.get(collectionEndpoint(eventId)).then(response => response.data)
const createCompetitor = ({ eventId, ...competitor }: CreateVariables) =>
  axios.post(collectionEndpoint(eventId), { competitor }, { headers: getHeaders() })
const updateCompetitor = ({ eventId, id, ...competitor }: UpdateVariables) =>
  axios.put(elementEndpoint(eventId, id), { competitor }, { headers: getHeaders() })
const deleteCompetitor = ({ eventId, id }: DeleteVariables) =>
  axios.delete(elementEndpoint(eventId, id), { headers: getHeaders() })

const collectionKey = (eventId: number): QueryKey => [
  'speedSkydivingCompetitions',
  eventId,
  'competitors'
]

const buildQueryFn = (
  queryClient: QueryClient
): QueryFunction<Competitor[], QueryKey> => async ctx => {
  const [_key, eventId] = ctx.queryKey
  const { relations, items } = await getCompetitors(eventId)

  cacheProfiles(relations.profiles, queryClient)
  cacheCountries(relations.countries, queryClient)

  return items.map(deserialize)
}

export const competitorsQuery = <Type = Competitor[]>(
  eventId: number,
  queryClient: QueryClient
): UseQueryOptions<Competitor[], Error, Type, QueryKey> => ({
  queryKey: collectionKey(eventId),
  queryFn: buildQueryFn(queryClient)
})

export const preloadCompetitors = (
  eventId: number,
  queryClient: QueryClient
): Promise<void> => queryClient.prefetchQuery(competitorsQuery(eventId, queryClient))

export const useCompetitorsQuery = <Type = Competitor[]>(
  eventId: number,
  options: UseQueryOptions<Competitor[], Error, Type, QueryKey>
): UseQueryResult<Type> => {
  const queryClient = useQueryClient()

  return useQuery({ ...competitorsQuery<Type>(eventId, queryClient), ...options })
}

export const useCompetitorQuery = (
  eventId: number,
  id: number
): UseQueryResult<Competitor | undefined> =>
  useCompetitorsQuery<Competitor | undefined>(eventId, {
    select: data => data.find(competitor => competitor.id === id)
  })

export const useNewCompetitorMutation = (
  options: MutationOptions = {}
): UseMutationResult<
  AxiosResponse<SerializedCompetitor>,
  AxiosError,
  CreateVariables
> => {
  const queryClient = useQueryClient()

  return useMutation(createCompetitor, {
    async onSuccess(response, { eventId }) {
      const data: Competitor[] = queryClient.getQueryData(collectionKey(eventId)) ?? []
      const competitor = deserialize(response.data)
      queryClient.setQueryData(collectionKey(eventId), [...data, competitor])
      await queryClient.refetchQueries(standingsQuery(eventId))
      options?.onSuccess?.(competitor)
    }
  })
}

export const useEditCompetitorMutation = (
  options: MutationOptions = {}
): UseMutationResult<
  AxiosResponse<SerializedCompetitor>,
  AxiosError,
  UpdateVariables
> => {
  const queryClient = useQueryClient()

  return useMutation(updateCompetitor, {
    async onSuccess(response, { eventId, id }) {
      const data: Competitor[] = queryClient.getQueryData(collectionKey(eventId)) ?? []
      const updatedCompetitor = deserialize(response.data)
      queryClient.setQueryData(
        collectionKey(eventId),
        data.map(competitor => (competitor.id === id ? updatedCompetitor : competitor))
      )
      await queryClient.refetchQueries(standingsQuery(eventId))
      options?.onSuccess?.(updatedCompetitor)
    }
  })
}

export const useDeleteCompetitorMutation = (
  options: MutationOptions = {}
): UseMutationResult<
  AxiosResponse<SerializedCompetitor>,
  AxiosError,
  DeleteVariables
> => {
  const queryClient = useQueryClient()

  return useMutation(deleteCompetitor, {
    async onSuccess(response, { eventId, id }) {
      const data: Competitor[] = queryClient.getQueryData(collectionKey(eventId)) ?? []
      const competitor = deserialize(response.data)
      await queryClient.refetchQueries(standingsQuery(eventId))
      queryClient.setQueryData(
        collectionKey(eventId),
        data.filter(competitor => competitor.id !== id)
      )
      options?.onSuccess?.(competitor)
    }
  })
}
