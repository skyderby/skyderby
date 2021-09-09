type SuitCategory = 'wingsuit' | 'tracksuit' | 'slick' | 'monotrack'

export type SuitRecord = {
  id: number
  name: string
  makeId: number
  category: SuitCategory
  editable: boolean
}

export type SuitsIndex = {
  items: SuitRecord[]
  currentPage: number
  totalPages: number
}

export type IndexParams = {
  search?: string
  page?: number
  perPage?: number
}

export type RecordQueryKey = ['suits', number | null | undefined]
export type IndexQueryKey = ['suits', IndexParams]
export type AllSuitsQueryKey = ['suits', 'all']
