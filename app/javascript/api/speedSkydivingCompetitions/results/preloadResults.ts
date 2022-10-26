import { QueryClient } from 'react-query'
import { resultsQuery } from './useResultsQuery'

const preloadResults = (eventId: number, queryClient: QueryClient): Promise<void> =>
  queryClient.prefetchQuery(resultsQuery(eventId))

export default preloadResults
