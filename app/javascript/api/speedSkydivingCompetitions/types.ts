import { EventStatus, EventVisibility } from 'api/events'

export interface TeamRecord {
  id: number
  name: string
  competitorIds: number[]
  createdAt: Date
  updatedAt: Date
}

export interface TeamStandingRow {
  rank: number
  teamId: number
  total: number
}

export interface CompetitorStandingRow {
  rank: number
  competitorId: number
  total: number
  average: number
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
  profileId: number
  categoryId: number
  teamId: number
  assignedNumber: number
  createdAt: Date
  updatedAt: Date
}

export interface Round {
  id: number
  number: number
  completed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Penalty {
  percent: number
  reason: string
}

export interface Result {
  id: number
  eventId: number
  competitorId: number
  roundId: number
  trackId: number
  exitAltitude: number
  result: number
  finalResult: number
  penaltySize: number
  windowStartTime: Date
  windowEndTime: Date
  penalties: Penalty[]
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
    canDownload: boolean
  }
}
