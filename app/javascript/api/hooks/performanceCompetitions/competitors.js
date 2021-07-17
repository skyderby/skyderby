import { useMutation, useQuery, useQueryClient } from 'react-query'
import axios from 'axios'
import { preloadProfiles } from 'api/hooks/profiles'
import { standingsQuery } from './standings'

const collectionEndpoint = eventId =>
  `/api/v1/performance_competitions/${eventId}/competitors`
const elementEndpoint = (eventId, id) => `${collectionEndpoint(eventId)}/${id}`

const getCompetitors = eventId => axios.get(collectionEndpoint(eventId))
const createCompetitor = ({ eventId, ...competitor }) =>
  axios.post(collectionEndpoint(eventId), { competitor })
const updateCompetitor = ({ eventId, id, ...competitor }) =>
  axios.put(elementEndpoint(eventId, id), { competitor })
const deleteCompetitor = ({ eventId, id }) => axios.delete(elementEndpoint(eventId, id))

const collectionKey = eventId => ['performanceCompetition', eventId, 'competitors']

const queryCompetitors = async (ctx, queryClient) => {
  const [_key, eventId] = ctx.queryKey
  const { data } = await getCompetitors(eventId)

  await preloadProfiles(
    data.map(record => record.profileId),
    queryClient
  )

  return data
}

const competitorsQuery = (eventId, queryClient, options) => ({
  queryKey: collectionKey(eventId),
  queryFn: ctx => queryCompetitors(ctx, queryClient),
  ...options
})

export const preloadCompetitors = (eventId, queryClient) =>
  queryClient.prefetchQuery(competitorsQuery(eventId, queryClient))

export const useCompetitorsQuery = eventId => {
  const queryClient = useQueryClient()

  return useQuery(competitorsQuery(eventId, queryClient))
}

export const useCompetitorQuery = (eventId, id) => {
  const queryClient = useQueryClient()

  return useQuery(
    competitorsQuery(eventId, queryClient, {
      select: data => data.find(competitor => competitor.id === id)
    })
  )
}

export const useNewCompetitorMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(createCompetitor, {
    onSuccess(response, { eventId }) {
      const data = queryClient.getQueryData(collectionKey(eventId))
      queryClient.setQueryData(collectionKey(eventId), [...data, response.data])
      queryClient.refetchQueries(standingsQuery(eventId, queryClient))
    }
  })
}

export const useEditCompetitorMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(updateCompetitor, {
    onSuccess(response, { eventId, id }) {
      const data = queryClient.getQueryData(collectionKey(eventId))
      queryClient.setQueryData(
        collectionKey(eventId),
        data.map(competitor => (competitor.id === id ? response.data : competitor))
      )
      queryClient.refetchQueries(standingsQuery(eventId, queryClient))
    }
  })
}

export const useDeleteCompetitorMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(deleteCompetitor, {
    async onSuccess(response, { eventId, id }) {
      const data = queryClient.getQueryData(collectionKey(eventId))
      await queryClient.refetchQueries(standingsQuery(eventId, queryClient))
      queryClient.setQueryData(
        collectionKey(eventId),
        data.filter(competitor => competitor.id !== id)
      )
    }
  })
}
