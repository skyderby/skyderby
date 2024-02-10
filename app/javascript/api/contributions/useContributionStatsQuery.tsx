import { AxiosResponse } from 'axios'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import client from 'api/client'

const contributionStatsSchema = z.object({
  thisMonthAmount: z.number(),
  past90DaysAmount: z.number(),
  pastYearAmount: z.number()
})

export type ContributionStats = z.infer<typeof contributionStatsSchema>

const endpoint = 'api/v1/contributions/stats'

const queryFn = () =>
  client
    .get<never, AxiosResponse<ContributionStats>>(endpoint)
    .then(response => contributionStatsSchema.parse(response.data))

const useContributionStatsQuery = () =>
  useQuery({
    queryKey: ['contributionStats'],
    queryFn
  })

export default useContributionStatsQuery
