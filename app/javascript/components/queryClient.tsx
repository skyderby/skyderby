import { QueryClient } from 'react-query'
import axios from 'axios'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnMount: false,
      retry: (failureCount, error) => {
        if (axios.isAxiosError(error)) {
          if ([401, 403, 404, 500].includes(error?.response?.status ?? -1)) return false
        }
        return failureCount < 3
      }
    }
  }
})

export default queryClient
