import { TrackVariables } from 'api/tracks'

export type FormData = TrackVariables & {
  formSupportData: {
    suitInputMode: 'input' | 'select'
    placeInputMode: 'input' | 'select'
  }
}
