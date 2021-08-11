import { useMutation, useQuery, useQueryClient } from 'react-query'
import axios from 'axios'

import { getCSRFToken } from 'utils/csrfToken'

const endpoint = eventId => `/api/v1/performance_competitions/${eventId}/rounds`
const getHeaders = () => ({ 'X-CSRF-Token': getCSRFToken() })

const getRounds = eventId => axios.get(endpoint(eventId))
const createRound = ({ eventId, ...round }) =>
  axios.post(endpoint(eventId), { round }, { headers: getHeaders() })
const deleteRound = ({ eventId, id }) =>
  axios.delete(`${endpoint(eventId)}/${id}`, { headers: getHeaders() })

const queryKey = eventId => ['performanceCompetition', eventId, 'rounds']

const queryFn = async ctx => {
  const [_key, eventId] = ctx.queryKey
  return getRounds(eventId).then(response => response.data)
}

const roundsQuery = (eventId, options = {}) => ({
  queryKey: queryKey(eventId),
  queryFn,
  ...options
})

export const preloadRounds = (eventId, queryClient) =>
  queryClient.prefetchQuery(roundsQuery(eventId))

export const useRoundsQuery = (eventId, options) =>
  useQuery(roundsQuery(eventId, options))

export const useRoundQuery = (eventId, id) =>
  useQuery(roundsQuery(eventId, { select: data => data.find(round => round.id === id) }))

export const useNewRoundMutation = eventId => {
  const queryClient = useQueryClient()

  const mutationFn = discipline => createRound({ eventId, discipline })

  return useMutation(mutationFn, {
    onSuccess(response) {
      const data = queryClient.getQueryData(queryKey(eventId)) ?? []
      queryClient.setQueryData(queryKey(eventId), [...data, response.data])
    }
  })
}

export const useDeleteRoundMutation = eventId => {
  const queryClient = useQueryClient()

  const mutationFn = id => deleteRound({ eventId, id })

  return useMutation(mutationFn, {
    onSuccess() {
      return queryClient.invalidateQueries(queryKey(eventId), { exact: true })
    }
  })
}
