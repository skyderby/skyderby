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
