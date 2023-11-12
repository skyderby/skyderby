import { useCallback, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  extractParamsFromUrl as extractTrackParamsFromUrl,
  mapParamsToUrl as mapTrackParamsToUrl,
  IndexParams,
  FilterTuple,
  TrackActivity,
  allowedActivities,
  isAllowedActivity
} from 'api/tracks'
import isEqual from 'lodash.isequal'
import type { Task } from './tasks'
import { allowedTasks, isAllowedTask } from './tasks'

interface ReplayURLParams {
  tracksParams: Omit<IndexParams, 'filters'> & { filters: FilterTuple[] }
  selectedTracks: number[]
  activity: TrackActivity
  task: Task
  windowStart: number | null
  windowEnd: number | null
}

const extractParamsFromUrl = (search: string): ReplayURLParams => {
  const tracksParams = extractTrackParamsFromUrl(search, 'tracks')

  const urlParams = new URLSearchParams(search)

  const selectedTracks = urlParams.getAll('selectedTracks[]').filter(Boolean).map(Number)

  const activityParam = urlParams.get('activity')
  const activity = isAllowedActivity(activityParam) ? activityParam : allowedActivities[0]

  const taskParam = urlParams.get('task')
  const task = isAllowedTask(taskParam) ? taskParam : allowedTasks[0]

  const windowStart = urlParams.has('windowStart')
    ? Number(urlParams.get('windowStart'))
    : null
  const windowEnd = urlParams.has('windowEnd') ? Number(urlParams.get('windowEnd')) : null

  return {
    tracksParams,
    selectedTracks,
    activity,
    task,
    windowStart,
    windowEnd
  }
}

const mapParamsToUrl = (params: ReplayURLParams): string => {
  const { activity, ...mergedTracksParams } = params.tracksParams
  const tracksParams = mapTrackParamsToUrl(mergedTracksParams, 'tracks')

  const urlParams = new URLSearchParams(tracksParams)

  params.selectedTracks.forEach(id => urlParams.append('selectedTracks[]', String(id)))
  urlParams.set('activity', params.activity)
  urlParams.set('task', params.task)
  if (params.windowStart) urlParams.set('windowStart', String(params.windowStart))
  if (params.windowEnd) urlParams.set('windowEnd', String(params.windowEnd))

  return urlParams.toString() === '' ? '' : '?' + urlParams.toString()
}

const usePageParams = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useMemo(() => extractParamsFromUrl(location.search), [location.search])

  const buildUrl = useCallback(
    (newParams: Partial<ReplayURLParams>) => {
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
    (filters: FilterTuple[]) =>
      navigate(`${location.pathname}${buildUrl({ tracksParams: { filters } })}`, {
        replace: true
      }),
    [buildUrl, navigate, location.pathname]
  )

  const setTask = useCallback(
    (activity: TrackActivity, task: Task) =>
      navigate(`${location.pathname}${buildUrl({ activity, task })}`, {
        replace: true
      }),
    [buildUrl, navigate, location.pathname]
  )

  const setWindow = useCallback(
    (params: { windowStart: number | null; windowEnd: number | null }) =>
      navigate(`${location.pathname}${buildUrl(params)}`, {
        replace: true
      }),
    [buildUrl, navigate, location.pathname]
  )

  const toggleTrack = useCallback(
    (trackId: number) => {
      const trackSelected = params.selectedTracks.includes(trackId)
      const selectedTracks = trackSelected
        ? params.selectedTracks.filter(el => el !== trackId)
        : [...params.selectedTracks, trackId]

      navigate(`${location.pathname}${buildUrl({ selectedTracks })}`, { replace: true })
    },
    [params, buildUrl, navigate, location.pathname]
  )

  return {
    params,
    updateFilters,
    setTask,
    setWindow,
    toggleTrack
  }
}

export default usePageParams
