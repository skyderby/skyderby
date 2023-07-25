import { useMutation, useQueryClient } from 'react-query'
import type { AxiosResponse, AxiosError } from 'axios'
import client from 'api/client'
import { standingsQuery } from 'api/speedSkydivingCompetitions/standings'
import type { Result, SerializedResult } from './common'
import { collectionEndpoint, queryKey, deserialize } from './common'

export type CreateVariables = {
  eventId: number
  competitorId: number
  roundId: number
  trackFrom: 'from_file' | 'existent'
  trackFile: File | null
  trackId: number | null
}

const createResult = (eventId: number, values: CreateVariables) => {
  const formData = new FormData()
  Object.entries(values).forEach(([key, value]) => {
    if (value === null) return

    if (typeof value === 'number') {
      formData.set(`result[${key}]`, value.toString())
    } else {
      formData.set(`result[${key}]`, value)
    }
  })

  return client.post<FormData, AxiosResponse<SerializedResult>>(
    collectionEndpoint(eventId),
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
}

const useCreateResultMutation = (eventId: number) => {
  const queryClient = useQueryClient()

  const mutationFn = (variables: CreateVariables) => createResult(eventId, variables)

  return useMutation<
    AxiosResponse<SerializedResult>,
    AxiosError<Record<string, string[]>>,
    CreateVariables
  >(mutationFn, {
    async onSuccess(response, { eventId }) {
      const data: Result[] = queryClient.getQueryData(queryKey(eventId)) ?? []
      const result = deserialize(response.data)

      queryClient.setQueryData(queryKey(eventId), [...data, result])
      await queryClient.refetchQueries(standingsQuery(eventId))
    }
  })
}

export default useCreateResultMutation
