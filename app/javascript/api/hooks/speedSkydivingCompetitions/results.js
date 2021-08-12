import { useQuery, useMutation, useQueryClient } from 'react-query'
import axios from 'axios'

import { standingsQuery } from './standings'
import { queryKey as trackQueryKey } from 'api/hooks/tracks/track'
import { queryKey as trackPointsQueryKey } from 'api/hooks/tracks/points'

const collectionEndpoint = eventId =>
  `/api/v1/speed_skydiving_competitions/${eventId}/results`
const elementEndpoint = (eventId, id) => `${collectionEndpoint(eventId)}/${id}`
const getResults = eventId => axios.get(collectionEndpoint(eventId))

const createResult = ({ eventId, ...values }) => {
  const formData = new FormData()
  Object.entries(values).forEach(([key, value]) => formData.set(`result[${key}]`, value))

  return axios.post(collectionEndpoint(eventId), formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
const updateResult = ({ eventId, id, ...result }) =>
  axios.put(elementEndpoint(eventId, id), { result })
const deleteResult = ({ eventId, id }) => axios.delete(elementEndpoint(eventId, id))

const queryKey = eventId => ['speedSkydivingCompetitions', eventId, 'results']

const queryFn = async ctx => {
  const [_key, eventId] = ctx.queryKey
  const { data } = await getResults(eventId)

  return data
}

const resultsQuery = (eventId, options = {}) => ({
  queryKey: queryKey(eventId),
  queryFn,
  ...options
})

export const preloadResults = (eventId, queryClient) =>
  queryClient.prefetchQuery(resultsQuery(eventId))

export const useResultsQuery = (eventId, options) =>
  useQuery(resultsQuery(eventId, options))

export const useResultQuery = (eventId, id) =>
  useQuery(
    resultsQuery(eventId, { select: data => data.find(result => result.id === id) })
  )

export const useNewResultMutation = (options = {}) => {
  const queryClient = useQueryClient()

  return useMutation(createResult, {
    async onSuccess(response, { eventId }) {
      const data = queryClient.getQueryData(queryKey(eventId))
      queryClient.setQueryData(queryKey(eventId), [...data, response.data])
      await queryClient.refetchQueries(standingsQuery(eventId, queryClient))
      options.onSuccess?.(response.data)
    }
  })
}

export const useEditResultMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(updateResult, {
    onSuccess(response, { eventId, id }) {
      const data = queryClient.getQueryData(queryKey(eventId))
      queryClient.setQueryData(
        queryKey(eventId),
        data.map(result => (result.id === id ? response.data : result))
      )
      queryClient.invalidateQueries(trackQueryKey(response.data.trackId))
      queryClient.invalidateQueries(
        trackPointsQueryKey(response.data.trackId, { originalFrequency: true }),
        { refetchInactive: true }
      )
      queryClient.refetchQueries(standingsQuery(eventId, queryClient))
    }
  })
}

export const useDeleteResultMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(deleteResult, {
    onSuccess(response, { eventId, id }) {
      const data = queryClient.getQueryData(queryKey(eventId))
      queryClient.setQueryData(
        queryKey(eventId),
        data.filter(result => result.id !== id)
      )
      queryClient.refetchQueries(standingsQuery(eventId, queryClient))
    }
  })
}
