import { useCallback } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import {
  extractParamsFromUrl as extractTrackParamsFromUrl,
  mapParamsToUrl as mapTrackParamsToUrl
} from 'api/hooks/tracks'

const extractParamsFromUrl = search => {
  const tracksParams = {
    ...extractTrackParamsFromUrl(search, 'tracks'),
    activity: 'base'
  }
  const urlParams = new URLSearchParams(search)

  const selectedTracks = urlParams.getAll('selectedTracks[]').filter(Boolean).map(Number)

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
}

const mapParamsToUrl = params => {
  const { activity, ...mergedTracksParams } = params.tracksParams
  const tracksParams = mapTrackParamsToUrl(mergedTracksParams, 'tracks')

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

const usePageParams = () => {
  const history = useHistory()
  const location = useLocation()
  const params = extractParamsFromUrl(location.search)

  const buildUrl = useCallback(
    newParams => {
      const mergedParams = {
        ...params,
        ...newParams,
        tracksParams: {
          ...params.tracksParams,
          ...newParams.tracksParams
        }
      }

      return mapParamsToUrl(mergedParams)
    },
    [params]
  )

  const updateFilters = useCallback(
    filters =>
      history.replace(`${location.pathname}${buildUrl({ tracksParams: { filters } })}`),
    [buildUrl, history, location.pathname]
  )

  const setSelectedTerrainProfile = useCallback(
    selectedTerrainProfile =>
      history.replace(`${location.pathname}${buildUrl({ selectedTerrainProfile })}`),
    [buildUrl, history, location.pathname]
  )

  const setAdditionalTerrainProfiles = useCallback(
    ids =>
      history.replace(
        `${location.pathname}${buildUrl({ additionalTerrainProfiles: ids })}`
      ),
    [buildUrl, history, location.pathname]
  )

  const deleteAdditionalTerrainProfile = useCallback(
    idToRemove => {
      history.replace(
        `${location.pathname}${buildUrl({
          additionalTerrainProfiles: params.additionalTerrainProfiles.filter(
            id => id !== idToRemove
          )
        })}`
      )
    },
    [params, buildUrl, history, location.pathname]
  )

  const toggleTrack = useCallback(
    trackId => {
      const trackSelected = params.selectedTracks.includes(trackId)
      const selectedTracks = trackSelected
        ? params.selectedTracks.filter(el => el !== trackId)
        : [...params.selectedTracks, trackId]

      history.replace(`${location.pathname}${buildUrl({ selectedTracks })}`)
    },
    [params, buildUrl, history, location.pathname]
  )

  return {
    params,
    updateFilters,
    setSelectedTerrainProfile,
    setAdditionalTerrainProfiles,
    deleteAdditionalTerrainProfile,
    toggleTrack
  }
}

export default usePageParams
