import { useMutation, useQuery, useQueryClient } from 'react-query'
import client from 'api/client'

import { preloadProfiles } from 'api/profiles'
import { standingsQuery } from './standings'
import { preloadSuits } from 'api/suits'

const collectionEndpoint = eventId =>
  `/api/v1/performance_competitions/${eventId}/competitors`
const elementEndpoint = (eventId, id) => `${collectionEndpoint(eventId)}/${id}`

const getCompetitors = eventId => client.get(collectionEndpoint(eventId))
const createCompetitor = ({ eventId, ...competitor }) =>
  client.post(collectionEndpoint(eventId), { competitor })
const updateCompetitor = ({ eventId, id, ...competitor }) =>
  client.put(elementEndpoint(eventId, id), { competitor })
const deleteCompetitor = ({ eventId, id }) => client.delete(elementEndpoint(eventId, id))

const collectionKey = eventId => ['performanceCompetition', eventId, 'competitors']

const queryCompetitors = async (ctx, queryClient) => {
  const [_key, eventId] = ctx.queryKey
  const { data } = await getCompetitors(eventId)

  await Promise.all([
    preloadProfiles(
      data.map(record => record.profileId),
      queryClient
    ),
    preloadSuits(
      data.map(record => record.suitId),
      queryClient
    )
  ])

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

export const useNewCompetitorMutation = (eventId, options = {}) => {
  const queryClient = useQueryClient()

  return useMutation(createCompetitor, {
    async onSuccess(response) {
      const data = queryClient.getQueryData(collectionKey(eventId))
      queryClient.setQueryData(collectionKey(eventId), [...data, response.data])
      await queryClient.refetchQueries(standingsQuery(eventId, queryClient))
      options.onSuccess?.()
    }
  })
}

export const useEditCompetitorMutation = (eventId, options = {}) => {
  const queryClient = useQueryClient()

  return useMutation(updateCompetitor, {
    async onSuccess(response, { eventId, id }) {
      const data = queryClient.getQueryData(collectionKey(eventId))
      queryClient.setQueryData(
        collectionKey(eventId),
        data.map(competitor => (competitor.id === id ? response.data : competitor))
      )
      await queryClient.refetchQueries(standingsQuery(eventId, queryClient))
      options.onSuccess?.()
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
