import axios from 'axios'

import { getCSRFToken, setCSRFToken } from 'utils/csrfToken'

const Registration = {
  create: async user => {
    const { data, headers } = await axios.post(
      '/api/users',
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
}

export default Registration
