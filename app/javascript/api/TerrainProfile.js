import axios from 'axios'

const endpoint = '/api/v1/terrain_profiles'

const TerrainProfile = {
  findAll: async () => {
    const { data } = await axios.get(endpoint)

    return data
  }
}

export default TerrainProfile
