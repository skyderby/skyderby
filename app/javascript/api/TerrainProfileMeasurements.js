import axios from 'axios'

const getUrl = terrainProfileId =>
  `/api/v1/terrain_profiles/${terrainProfileId}/measurements`

const TerrainProfileMeasurements = {
  findAll: async terrainProfileId => {
    const { data } = await axios.get(getUrl(terrainProfileId))

    return data
  }
}

export default TerrainProfileMeasurements
