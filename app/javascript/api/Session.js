import axios from 'axios'

import { getCSRFToken, setCSRFToken } from 'utils/csrfToken'

const Session = {
  load: async () => {
    const { data } = await axios.get('/api/v1/current_user')

    return data
  },

  login: async user => {
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
  },

  logout: async () => {
    const { data } = await axios.delete('/api/users/sign_out', {
      headers: {
        Accept: 'application/json',
        'X-CSRF-Token': getCSRFToken()
      }
    })

    const { newCsrfToken } = data

    setCSRFToken(newCsrfToken)
  }
}

export default Session
