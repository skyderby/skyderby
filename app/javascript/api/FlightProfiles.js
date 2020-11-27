import { IndexParams } from 'api/Track'

export const PageParams = {
  extractFromUrl: search => {
    const tracksParams = {
      ...IndexParams.extractFromUrl(search, 'tracks'),
      activity: 'base'
    }
    const urlParams = new URLSearchParams(search)

    const selectedTracks = urlParams.get('selectedTracks')
      ? urlParams.get('selectedTracks').split(',').map(Number)
      : []

    const selectedTerrainProfile =
      urlParams.get('selectedTerrainProfile') &&
      Number(urlParams.get('selectedTerrainProfile'))

    const straightLine = urlParams.get('straight-line') !== 'false'

    return { tracksParams, selectedTracks, selectedTerrainProfile, straightLine }
  },

  mapToUrl: params => {
    const { activity, ...mergedTracksParams } = params.tracksParams
    const tracksParams = IndexParams.mapToUrl(mergedTracksParams, 'tracks')

    const urlParams = new URLSearchParams(tracksParams)

    if (params.selectedTracks.length > 0) {
      urlParams.set('selectedTracks', params.selectedTracks.join(','))
    }

    if (params.straightLine === false) urlParams.set('straight-line', false)

    if (params.selectedTerrainProfile) {
      urlParams.set('selectedTerrainProfile', params.selectedTerrainProfile)
    }

    return urlParams.toString() === '' ? '' : '?' + urlParams.toString()
  }
}
