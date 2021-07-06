import { useQuery, useMutation, useQueryClient } from 'react-query'
import axios from 'axios'

import { competitorsQuery } from './competitors'
import { teamStandingsQuery } from './teamStandings'

const collectionUrl = eventId => `/api/v1/speed_skydiving_competitions/${eventId}/teams`
const elementUrl = (eventId, id) => `${collectionUrl(eventId)}/${id}`

const getTeams = eventId => axios.get(collectionUrl(eventId))
const createTeam = ({ eventId, ...team }) => axios.post(collectionUrl(eventId), { team })
const updateTeam = ({ eventId, id, ...team }) =>
  axios.put(elementUrl(eventId, id), { team })
const deleteTeam = ({ eventId, id }) => axios.delete(elementUrl(eventId, id))

const queryKey = eventId => ['speedSkydivingCompetitions', eventId, 'teams']

const queryFn = ctx => {
  const [_key, eventId] = ctx.queryKey
  return getTeams(eventId).then(response => response.data)
}

const teamsQuery = (eventId, options = {}) => ({
  queryKey: queryKey(eventId),
  queryFn,
  ...options
})

export const preloadTeams = (eventId, queryClient) =>
  queryClient.prefetchQuery(teamsQuery(eventId, queryClient))

export const useTeamsQuery = eventId => useQuery(teamsQuery(eventId))

export const useTeamQuery = (eventId, id) =>
  useQuery(teamsQuery(eventId, { select: data => data.find(team => team.id === id) }))

export const useNewTeamMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(createTeam, {
    async onSuccess(response, { eventId }) {
      await Promise.all([
        queryClient.refetchQueries(teamStandingsQuery(eventId, queryClient)),
        queryClient.refetchQueries(competitorsQuery(eventId, queryClient))
      ])

      const data = queryClient.getQueryData(queryKey(eventId))
      queryClient.setQueryData(queryKey(eventId), [...data, response.data])
    }
  })
}

export const useEditTeamMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(updateTeam, {
    async onSuccess(response, { eventId, id }) {
      await Promise.all([
        queryClient.refetchQueries(teamStandingsQuery(eventId, queryClient)),
        queryClient.refetchQueries(competitorsQuery(eventId, queryClient))
      ])

      const data = queryClient.getQueryData(queryKey(eventId))
      queryClient.setQueryData(
        queryKey(eventId),
        data.map(team => (team.id === id ? response.data : team))
      )
    }
  })
}

export const useDeleteTeamMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(deleteTeam, {
    async onSuccess(response, { eventId, id }) {
      await Promise.all([
        queryClient.refetchQueries(teamStandingsQuery(eventId, queryClient)),
        queryClient.refetchQueries(competitorsQuery(eventId, queryClient))
      ])

      const data = queryClient.getQueryData(queryKey(eventId))
      queryClient.setQueryData(
        queryKey(eventId),
        data.filter(team => team.id !== id)
      )
    }
  })
}
