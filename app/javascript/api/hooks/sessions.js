import axios from 'axios'
import { useQuery, useQueryClient, useMutation } from 'react-query'

import { getCSRFToken, setCSRFToken } from 'utils/csrfToken'

const getCurrentUser = () =>
  axios.get('/api/v1/current_user').then(response => response.data)

const login = async user => {
  const { data, headers } = await axios.post(
    '/api/users/sign_in',
    { user },
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCSRFToken()
      }
    }
  )

  setCSRFToken(headers['new-csrf-token'])

  return data
}

const logout = async () => {
  const { headers } = await axios.delete('/api/users/sign_out', {
    headers: {
      Accept: 'application/json',
      'X-CSRF-Token': getCSRFToken()
    }
  })

  setCSRFToken(headers['new-csrf-token'])
}

const queryKey = ['currentUser']

export const useCurrentUserQuery = () => useQuery({ queryKey, queryFn: getCurrentUser })

export const useLoginMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(login, {
    onSuccess(response) {
      queryClient.setQueryData(queryKey, response.data)
    }
  })
}

export const useLogoutMutation = () => {
  const queryClient = useQueryClient()

  return useMutation(logout, {
    onSuccess() {
      queryClient.removeQueries(queryKey)
    }
  })
}
