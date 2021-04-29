import axios from 'axios'

const endpoint = '/api/v1/performance_competitions'

const Standings = {
  findAll: async eventId => {
    const { data } = await axios.get(`${endpoint}/${eventId}/standings`)

    return data
  }
}

export default Standings
