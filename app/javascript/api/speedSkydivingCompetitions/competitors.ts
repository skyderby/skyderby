import client, { AxiosError, AxiosResponse } from 'api/client'
import {
  useMutation,
  useQueryClient,
  QueryFunction,
  UseQueryOptions,
  UseMutationResult,
  useSuspenseQuery,
  UseSuspenseQueryResult,
  UseSuspenseQueryOptions
} from '@tanstack/react-query'
import { parseISO } from 'date-fns'
import queryClient from 'components/queryClient'
import { cacheProfiles, Profile } from 'api/profiles'
import { cacheCountries, CountryRecord } from 'api/countries'
import { standingsQuery } from './standings'
import { Competitor } from './types'

type SerializedCompetitor = {
  [K in keyof Competitor]: Competitor[K] extends Date ? string : Competitor[K]
}

interface IndexResponse {
  items: SerializedCompetitor[]
  relations: {
    profiles: Profile[]
    countries: CountryRecord[]
  }
}

interface CompetitorVariables {
  categoryId: number | null
  assignedNumber: number | null
  profileId?: number | null
  profileAttributes: {
    name: string
    countryId: number | null
  } | null
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

const getCompetitors = (eventId: number) =>
  client
    .get<never, AxiosResponse<IndexResponse>>(collectionEndpoint(eventId))
    .then(response => response.data)

const createCompetitor = (eventId: number, competitor: CompetitorVariables) =>
  client.post<{ competitor: CompetitorVariables }, AxiosResponse<SerializedCompetitor>>(
    collectionEndpoint(eventId),
    { competitor }
  )

const updateCompetitor = (eventId: number, id: number, competitor: CompetitorVariables) =>
  client.put<{ competitor: CompetitorVariables }, AxiosResponse<SerializedCompetitor>>(
    elementEndpoint(eventId, id),
    { competitor }
  )

const deleteCompetitor = (eventId: number, id: number) =>
  client.delete<never, AxiosResponse<SerializedCompetitor>>(elementEndpoint(eventId, id))

const collectionKey = (eventId: number): QueryKey => [
  'speedSkydivingCompetitions',
  eventId,
  'competitors'
]

const queryFn: QueryFunction<Competitor[], QueryKey> = async ctx => {
  const [_key, eventId] = ctx.queryKey
  const { relations, items } = await getCompetitors(eventId)

  cacheProfiles(relations.profiles)
  cacheCountries(relations.countries)

  return items.map(deserialize)
}

export const competitorsQuery = <Type = Competitor[]>(
  eventId: number
): UseQueryOptions<Competitor[], Error, Type, QueryKey> => ({
  queryKey: collectionKey(eventId),
  queryFn
})

export const preloadCompetitors = (eventId: number): Promise<void> =>
  queryClient.prefetchQuery(competitorsQuery(eventId))

export const useCompetitorsQuery = <Type = Competitor[]>(
  eventId: number,
  options?: Omit<
    UseSuspenseQueryOptions<Competitor[], Error, Type, QueryKey>,
    'queryKey' | 'queryFn'
  >
): UseSuspenseQueryResult<Type> =>
  useSuspenseQuery({ ...competitorsQuery<Type>(eventId), ...options })

export const useCompetitorQuery = (
  eventId: number,
  id: number
): UseSuspenseQueryResult<Competitor | undefined> =>
  useCompetitorsQuery<Competitor | undefined>(eventId, {
    select: data => data.find(competitor => competitor.id === id)
  })

export type NewCompetitorMutation = UseMutationResult<
  AxiosResponse<SerializedCompetitor>,
  AxiosError,
  CompetitorVariables
>

export const useNewCompetitorMutation = (
  eventId: number,
  options: MutationOptions = {}
): NewCompetitorMutation => {
  const queryClient = useQueryClient()

  const mutationFn = (variables: CompetitorVariables) =>
    createCompetitor(eventId, variables)

  return useMutation({
    mutationFn,
    async onSuccess(response) {
      const data: Competitor[] = queryClient.getQueryData(collectionKey(eventId)) ?? []
      const competitor = deserialize(response.data)
      queryClient.setQueryData(collectionKey(eventId), [...data, competitor])
      await queryClient.refetchQueries(standingsQuery(eventId))
      options?.onSuccess?.(competitor)
    }
  })
}

export type EditCompetitorMutation = UseMutationResult<
  AxiosResponse<SerializedCompetitor>,
  AxiosError,
  CompetitorVariables
>

export const useEditCompetitorMutation = (
  eventId: number,
  competitorId: number,
  options: MutationOptions = {}
): EditCompetitorMutation => {
  const queryClient = useQueryClient()

  const mutationFn = (variables: CompetitorVariables) =>
    updateCompetitor(eventId, competitorId, variables)

  return useMutation({
    mutationFn,
    async onSuccess(response) {
      const data: Competitor[] = queryClient.getQueryData(collectionKey(eventId)) ?? []
      const updatedCompetitor = deserialize(response.data)
      queryClient.setQueryData(
        collectionKey(eventId),
        data.map(competitor =>
          competitor.id === competitorId ? updatedCompetitor : competitor
        )
      )
      await queryClient.refetchQueries(standingsQuery(eventId))
      options?.onSuccess?.(updatedCompetitor)
    }
  })
}

export const useDeleteCompetitorMutation = (
  eventId: number,
  competitorId: number,
  options: MutationOptions = {}
): UseMutationResult<AxiosResponse<SerializedCompetitor>, AxiosError> => {
  const queryClient = useQueryClient()

  const mutationFn = () => deleteCompetitor(eventId, competitorId)

  return useMutation({
    mutationFn,
    async onSuccess(response) {
      const data: Competitor[] = queryClient.getQueryData(collectionKey(eventId)) ?? []
      const competitor = deserialize(response.data)
      await queryClient.refetchQueries(standingsQuery(eventId))
      queryClient.setQueryData(
        collectionKey(eventId),
        data.filter(competitor => competitor.id !== competitorId)
      )
      options?.onSuccess?.(competitor)
    }
  })
}
