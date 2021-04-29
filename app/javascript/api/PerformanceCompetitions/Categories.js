import axios from 'axios'

const endpoint = '/api/v1/performance_competitions'

const Categories = {
  findAll: async eventId => {
    const { data } = await axios.get(`${endpoint}/${eventId}/categories`)

    return data
  }
}

export default Categories
