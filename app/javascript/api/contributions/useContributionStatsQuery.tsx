import { AxiosResponse } from 'axios'
import { useQuery } from '@tanstack/react-query'
import client from 'api/client'

export type ContributionStats = {
  thisMonthAmount: number
  past90DaysAmount: number
  pastYearAmount: number
}

const endpoint = 'api/v1/contributions/stats'

const getContributionStats = () =>
  client
    .get<never, AxiosResponse<ContributionStats>>(endpoint)
    .then(response => response.data)

const useContributionStatsQuery = () =>
  useQuery({
    queryKey: ['contributionStats'],
    queryFn: getContributionStats
  })

export default useContributionStatsQuery
