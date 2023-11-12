import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query'
import client, { AxiosError } from 'api/client'
import { copyEndpoint } from './common'
import { AxiosResponse } from 'axios'
import { competitorsQuery } from './useCompetitorsQuery'
import { standingsQuery } from 'api/performanceCompetitions/useStandingsQuery'

type Variables = {
  sourceEventId: number
}

const copyCompetitors = (eventId: number, sourceEventId: number) =>
  client.post<Variables, AxiosResponse>(copyEndpoint(eventId), {
    sourceEventId
  })

const useCopyCompetitorsMutation = (
  eventId: number
): UseMutationResult<AxiosResponse, AxiosError, Variables> => {
  const queryClient = useQueryClient()
  const mutationFn = ({ sourceEventId }: Variables) =>
    copyCompetitors(eventId, sourceEventId)

  return useMutation({
    mutationFn,
    async onSuccess() {
      await queryClient.refetchQueries(competitorsQuery(eventId, queryClient))
      await queryClient.refetchQueries(standingsQuery(eventId))
    }
  })
}

export default useCopyCompetitorsMutation
