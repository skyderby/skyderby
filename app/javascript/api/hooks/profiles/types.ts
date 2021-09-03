export type ProfileRecord = {
  id: number
  name: string
  countryId: number
  photo: {
    original: string
    medium: string
    thumb: string
  }
}

export type ProfilesIndex = {
  items: ProfileRecord[]
  currentPage: number
  totalPages: number
}

export type IndexParams = {
  search?: string
  page?: number
  perPage?: number
}

export type RecordQueryKey = ['profiles', number | undefined]
export type IndexQueryKey = ['profiles', IndexParams]
