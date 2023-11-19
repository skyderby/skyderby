import { z } from 'zod'
import { ManufacturerRecord } from 'api/manufacturer'

export const suitCategoriesEnum = z.enum([
  'wingsuit',
  'tracksuit',
  'slick',
  'monotrack'
] as const)
export type SuitCategory = z.infer<typeof suitCategoriesEnum>

export const suitSchema = z.object({
  id: z.number(),
  name: z.string(),
  makeId: z.number(),
  category: suitCategoriesEnum,
  editable: z.boolean()
})

export type SuitRecord = z.infer<typeof suitSchema>

export type SuitsIndex = {
  items: SuitRecord[]
  currentPage: number
  totalPages: number
  relations: {
    manufacturers: ManufacturerRecord[]
  }
}

export type IndexParams = {
  search?: string
  manufacturerId?: number
  page?: number
  perPage?: number
}

export type RecordQueryKey = ['suits', number | null | undefined]
export type IndexQueryKey = ['suits', IndexParams]
