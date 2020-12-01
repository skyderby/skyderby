import { IndexParams } from 'api/Track'

export const PageParams = {
  extractFromUrl: search => {
    const tracksParams = {
      ...IndexParams.extractFromUrl(search, 'tracks'),
      activity: 'base'
    }
    const urlParams = new URLSearchParams(search)

    const selectedTracks = urlParams
      .getAll('selectedTracks[]')
      .filter(Boolean)
      .map(Number)

    const selectedTerrainProfile =
      urlParams.get('selectedTerrainProfile') &&
      Number(urlParams.get('selectedTerrainProfile'))

    const additionalTerrainProfiles = urlParams
      .getAll('additionalTerrainProfiles[]')
      .filter(Boolean)
      .map(Number)

    return {
      tracksParams,
      selectedTracks,
      selectedTerrainProfile,
      additionalTerrainProfiles
    }
  },

  mapToUrl: params => {
    const { activity, ...mergedTracksParams } = params.tracksParams
    const tracksParams = IndexParams.mapToUrl(mergedTracksParams, 'tracks')

    const urlParams = new URLSearchParams(tracksParams)

    params.selectedTracks.forEach(id => urlParams.append('selectedTracks[]', id))

    if (params.selectedTerrainProfile) {
      urlParams.set('selectedTerrainProfile', params.selectedTerrainProfile)
    }

    Array.from(new Set(params.additionalTerrainProfiles)).forEach(id =>
      urlParams.append('additionalTerrainProfiles[]', id)
    )

    return urlParams.toString() === '' ? '' : '?' + urlParams.toString()
  }
}
