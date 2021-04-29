import axios from 'axios'

const endpoint = '/api/v1/performance_competitions'

const Competitors = {
  findAll: async eventId => {
    const { data } = await axios.get(`${endpoint}/${eventId}/competitors`)

    return data
  }
}

export default Competitors
