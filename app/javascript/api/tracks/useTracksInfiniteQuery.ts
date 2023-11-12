import { useInfiniteQuery } from '@tanstack/react-query'
import { IndexParams } from './common'
import { queryFn } from './useTracksQuery'

const useTracksInfiniteQuery = ({ page, ...params }: IndexParams) =>
  useInfiniteQuery({
    queryKey: ['infiniteTracks', params],
    queryFn: queryFn,
    initialPageParam: 1,
    getNextPageParam: lastPage => {
      if (lastPage.currentPage >= lastPage.totalPages) return undefined
      return lastPage.currentPage + 1
    },
    staleTime: 30 * 1000
  })

export default useTracksInfiniteQuery
