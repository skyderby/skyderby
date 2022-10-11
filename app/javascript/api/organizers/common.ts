import { Serialized } from 'api/helpers'
import { parseISO } from 'date-fns'
import { ProfileRecord } from 'api/profiles'
import { CountryRecord } from 'api/countries'

export interface Organizer {
  id: number
  userId: number
  profileId: number
  createdAt: Date
  updatedAt: Date
}

export type SerializedOrganizer = Serialized<Organizer>

export interface IndexResponse {
  items: SerializedOrganizer[]
  relations: {
    profiles: ProfileRecord[]
    countries: CountryRecord[]
  }
}

export type QueryKey = ['organizers', EventType, number]

export type EventType = 'speedSkydiving'

export const queryKey = (eventType: EventType, eventId: number): QueryKey => [
  'organizers',
  eventType,
  eventId
]

export const collectionUrl = (eventType: EventType, eventId: number) => {
  const pathByType = {
    speedSkydiving: 'speed_skydiving_competitions'
  }

  return `/api/v1/${pathByType[eventType]}/${eventId}/organizers`
}

export const deserialize = (organizer: SerializedOrganizer): Organizer => ({
  ...organizer,
  createdAt: parseISO(organizer.createdAt),
  updatedAt: parseISO(organizer.updatedAt)
})
