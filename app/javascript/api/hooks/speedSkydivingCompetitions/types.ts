import { EventStatus, EventVisibility } from 'api/hooks/events'

export interface TeamRecord {
  id: number
  name: number
  competitorIds: number[]
  createdAt: Date
  updatedAt: Date
}

export interface TeamStandingRow {
  rank: number
  teamId: number
  total: number | null
}

export interface CompetitorStandingRow {
  rank: number
  competitorId: number
  total: number | null
  average: number | null
}

export interface CategoryStandings {
  categoryId: number
  rows: CompetitorStandingRow[]
}

export interface Category {
  id: number
  name: string
  position: number
  createdAt: Date
  updatedAt: Date
}

export interface Competitor {
  id: number
  profile_id: number
  category_id: number
  team_id: number
  assigned_number: number
  createdAt: Date
  updatedAt: Date
}

export interface Round {
  id: number
  number: number
  createdAt: Date
  updatedAt: Date
}

export interface Result {
  id: number
  eventId: number
  competitorId: number
  roundId: number
  trackId: number
  exitAltitude: number
  result: number
  windowStartTime: Date
  windowEndTime: Date
  createdAt: Date
  updatedAt: Date
}

export interface SpeedSkydivingCompetition {
  id: number
  name: string
  startsAt: Date
  placeId: number
  visibility: EventVisibility
  status: EventStatus
  useTeams: boolean
  useOpenScoreboard: boolean
  createdAt: Date
  updatedAt: Date

  permissions: {
    canEdit: boolean
  }
}
