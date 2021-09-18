import { useCallback } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import {
  extractParamsFromUrl as extractTrackParamsFromUrl,
  mapParamsToUrl as mapTrackParamsToUrl,
  IndexParams,
  TrackFilters,
  FilterTuple
} from 'api/hooks/tracks'

interface FlightProfilesURLParams {
  tracksParams: Omit<IndexParams, 'filters'> & { filters: FilterTuple[] }
  selectedTracks: number[]
  selectedTerrainProfile: number | null
  additionalTerrainProfiles: number[]
}

const extractParamsFromUrl = (search: string): FlightProfilesURLParams => {
  const tracksParams = Object.assign(extractTrackParamsFromUrl(search, 'tracks'), {
    activity: 'base'
  })

  const urlParams = new URLSearchParams(search)

  const selectedTracks = urlParams.getAll('selectedTracks[]').filter(Boolean).map(Number)

  const selectedTerrainProfile = urlParams.get('selectedTerrainProfile')
    ? Number(urlParams.get('selectedTerrainProfile'))
    : null

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

const mapParamsToUrl = (params: FlightProfilesURLParams): string => {
  const { activity, ...mergedTracksParams } = params.tracksParams
  const tracksParams = mapTrackParamsToUrl(mergedTracksParams, 'tracks')

  const urlParams = new URLSearchParams(tracksParams)

  params.selectedTracks.forEach(id => urlParams.append('selectedTracks[]', String(id)))

  if (params.selectedTerrainProfile) {
    urlParams.set('selectedTerrainProfile', String(params.selectedTerrainProfile))
  }

  Array.from(new Set(params.additionalTerrainProfiles)).forEach(id =>
    urlParams.append('additionalTerrainProfiles[]', String(id))
  )

  return urlParams.toString() === '' ? '' : '?' + urlParams.toString()
}

type PageParams = {
  params: FlightProfilesURLParams
  setSelectedTerrainProfile: (id: number | null) => void
  setAdditionalTerrainProfiles: (ids: number[]) => void
  deleteAdditionalTerrainProfile: (id: number) => void
  toggleTrack: (id: number) => void
  updateFilters: (filters: TrackFilters) => void
}

const usePageParams = (): PageParams => {
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
