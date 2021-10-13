import { useMutation, UseMutationOptions, UseMutationResult } from 'react-query'
import axios, { AxiosError, AxiosResponse } from 'axios'

const endpoint = '/api/v1/tracks/files'

export type Segment = {
  name: string
  pointsCount: number
  hUp: number
  hDown: number
}

export type TrackFileRecord = {
  id: number
  file_format: 'wintec' | 'kml' | 'gpx' | 'flysight' | 'columbus'
  segmentsCount: number
  segments?: Segment[]
}

const createTrackFile = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  return axios
    .post<FormData, AxiosResponse<TrackFileRecord>>(endpoint, formData)
    .then(response => response.data)
}

export const useNewTrackFileMutation = (
  options: UseMutationOptions<TrackFileRecord, AxiosError, File> = {}
): UseMutationResult<TrackFileRecord, AxiosError, File> =>
  useMutation(createTrackFile, options)
