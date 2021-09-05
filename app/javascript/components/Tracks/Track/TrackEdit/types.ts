import { TrackFields } from 'api/hooks/tracks'

export type FormData = TrackFields & {
  formSupportData: {
    suitInputMode: 'input' | 'select'
    placeInputMode: 'input' | 'select'
  }
}
