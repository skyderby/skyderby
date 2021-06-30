import { useQuery, useMutation, useQueryClient } from 'react-query'

import axios from 'axios'

const endpoint = eventId => `/api/v1/speed_skydiving_competitions/${eventId}/rounds`

const getRounds = eventId => axios.get(endpoint(eventId))
const createRound = eventId => axios.post(endpoint(eventId))
const deleteRound = ({ eventId, roundId }) =>
  axios.delete(`${endpoint(eventId)}/${roundId}`)

const queryKey = eventId => ['speedSkydivingCompetitions', eventId, 'rounds']

const queryFn = async ctx => {
  const [_key, eventId] = ctx.queryKey
  const { data } = await getRounds(eventId)

  return data
}

const getQueryOptions = eventId => ({
  queryKey: queryKey(eventId),
  queryFn
})

export const preloadRounds = (eventId, queryClient) =>
  queryClient.prefetchQuery(getQueryOptions(eventId))

export const useRoundsQuery = eventId => useQuery(getQueryOptions(eventId))

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
