import axios from 'axios'

const endpoint = '/api/v1/suits/stats'

const Stats = {
  findAll: async (ids = []) => {
    const urlParams = new URLSearchParams()

    ids.forEach(id => urlParams.append('ids[]', id))

    const url = `${endpoint}?${urlParams.toString()}`

    const { data } = await axios.get(url)

    return data
  }
}

export default Stats
