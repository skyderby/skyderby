import { useQueries, UseQueryResult } from '@tanstack/react-query'
import { ProfileRecord } from './common'
import { profileQuery } from './useProfileQuery'

// See: https://github.com/tannerlinsley/react-query/issues/1675
// Unable to type useQueries options or results without casting
const useProfileQueries = (ids: number[]): UseQueryResult<ProfileRecord>[] => {
  const queries = ids.map(id => profileQuery(id))

  return useQueries({ queries }) as UseQueryResult<ProfileRecord>[]
}

export default useProfileQueries
