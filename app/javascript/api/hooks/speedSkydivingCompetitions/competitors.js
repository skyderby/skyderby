import axios from 'axios'
import { useQuery, useMutation, useQueryClient } from 'react-query'

import { preloadProfiles } from 'api/hooks/profiles'
import { standingsQuery } from './standings'

const collectionEndpoint = eventId =>
  `/api/v1/speed_skydiving_competitions/${eventId}/competitors`
const elementEndpoint = (eventId, id) => `${collectionEndpoint(eventId)}/${id}`

const getCompetitors = eventId => axios.get(collectionEndpoint(eventId))
const getCompetitor = (eventId, id) => axios.get(elementEndpoint(eventId, id))
const createCompetitor = ({ eventId, ...competitor }) =>
  axios.post(collectionEndpoint(eventId), { competitor })
const deleteCompetitor = ({ eventId, id }) => axios.delete(elementEndpoint(eventId, id))

const collectionKey = eventId => ['speedSkydivingCompetitions', eventId, 'competitors']
const elementKey = (eventId, id) => collectionKey(eventId).concat(id)

const queryCompetitors = async (ctx, queryClient) => {
  const [_key, eventId] = ctx.queryKey
  const { data } = await getCompetitors(eventId)

  await preloadProfiles(
    data.map(competitor => competitor.profileId),
    queryClient
  )

  data.forEach(competitor =>
    queryClient.setQueryData(elementKey(eventId, competitor.id), competitor)
  )

  return data
}

const queryCompetitor = async ctx => {
  const [_key, eventId, _model, id] = ctx
  return getCompetitor(eventId, id).then(response => response.data)
}

const competitorsQuery = (eventId, queryClient) => ({
  queryKey: collectionKey(eventId),
  queryFn: ctx => queryCompetitors(ctx, queryClient)
})

const competitorQuery = (eventId, id) => ({
  queryKey: elementKey(eventId, id),
  queryFn: queryCompetitor
})

export const preloadCompetitors = (eventId, queryClient) =>
  queryClient.prefetchQuery(competitorsQuery(eventId, queryClient))

export const useCompetitorsQuery = eventId => useQuery(competitorsQuery(eventId))

export const useCompetitorQuery = (eventId, id) => useQuery(competitorQuery(eventId, id))

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
