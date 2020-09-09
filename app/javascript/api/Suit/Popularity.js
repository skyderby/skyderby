import axios from 'axios'

const endpoint = '/api/v1/suits/popularity'

const Popularity = {
  findAll: async ({ periodFrom, periodTo, activity } = {}) => {
    const urlParams = new URLSearchParams()

    if (periodFrom) urlParams.set('periodFrom', periodFrom)
    if (periodTo) urlParams.set('periodTo', periodTo)
    if (activity) urlParams.set('activity', activity)

    const url = `${endpoint}?${urlParams.toString()}`

    const { data } = await axios.get(url)

    return data
  }
}

export default Popularity
