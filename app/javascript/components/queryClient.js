import { QueryClient } from 'react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnMount: false,
      retry: (failureCount, error) => {
        if ([401, 403, 404, 500].includes(error?.response?.status)) return false
        return failureCount < 3
      }
    }
  }
})

export default queryClient
