import { TrackFields } from 'api/tracks'

export type FormData = TrackFields & {
  formSupportData: {
    suitInputMode: 'input' | 'select'
    placeInputMode: 'input' | 'select'
  }
}
