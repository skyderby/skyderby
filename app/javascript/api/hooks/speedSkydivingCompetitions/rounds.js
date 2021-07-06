import { useQuery, useMutation, useQueryClient } from 'react-query'
import axios from 'axios'

const endpoint = eventId => `/api/v1/speed_skydiving_competitions/${eventId}/rounds`

const getRounds = eventId => axios.get(endpoint(eventId))
const createRound = eventId => axios.post(endpoint(eventId))
const deleteRound = ({ eventId, roundId }) =>
  axios.delete(`${endpoint(eventId)}/${roundId}`)

const queryKey = eventId => ['speedSkydivingCompetitions', eventId, 'rounds']

const queryFn = ctx => {
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

export const useRoundsQuery = eventId => useQuery(roundsQuery(eventId))

export const useRoundQuery = (eventId, id) =>
  useQuery(roundsQuery(eventId, { select: data => data.find(round => round.id === id) }))

export const useNewRoundMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(createRound, {
    onSuccess(response, eventId) {
      const data = queryClient.getQueryData(queryKey(eventId))
      queryClient.setQueryData(queryKey(eventId), [...data, response.data])
    }
  })
}

export const useDeleteRoundMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(deleteRound, {
    onSuccess(response, { eventId }) {
      return queryClient.invalidateQueries(queryKey(eventId), { exact: true })
    }
  })
}
