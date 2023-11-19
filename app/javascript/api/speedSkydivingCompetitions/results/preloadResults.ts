import { resultsQuery } from './useResultsQuery'
import queryClient from 'components/queryClient'

const preloadResults = (eventId: number): Promise<void> =>
  queryClient.prefetchQuery(resultsQuery(eventId))

export default preloadResults
