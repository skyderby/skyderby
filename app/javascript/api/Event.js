import axios from 'axios'

const endpoint = '/api/v1/events'

const Event = {
  findAll: async ({ page = 1, perPage = 10 }) => {
    const urlParams = new URLSearchParams()
    urlParams.set('page', page)
    urlParams.set('perPage', perPage)

    const { data } = await axios.get([endpoint, urlParams.toString()].join('?'))

    return data
  }
}

export default Event
