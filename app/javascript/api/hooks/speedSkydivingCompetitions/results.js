import { useQuery, useMutation, useQueryClient } from 'react-query'
import axios from 'axios'

import { standingsQuery } from './standings'

const endpoint = eventId => `/api/v1/speed_skydiving_competitions/${eventId}/results`

const getResults = eventId => axios.get(endpoint(eventId))

const createResult = ({ eventId, ...values }) => {
  const formData = new FormData()
  Object.entries(values)
    .filter(([key]) => key !== 'trackFile')
    .forEach(([key, value]) => formData.set(`result[${key}]`, value))
  formData.set('result[trackAttributes][file]', values.trackFile)

  return axios.post(endpoint(eventId), formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

const deleteResult = ({ eventId, id }) => axios.delete(`${endpoint(eventId)}/${id}`)

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

export const useResultsQuery = eventId => useQuery(resultsQuery(eventId))

export const useResultQuery = (eventId, id) =>
  useQuery(
    resultsQuery(eventId, { select: data => data.find(result => result.id === id) })
  )

export const useNewResultMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(createResult, {
    onSuccess(response, { eventId }) {
      const data = queryClient.getQueryData(queryKey(eventId))
      queryClient.setQueryData(queryKey(eventId), [...data, response.data])
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
