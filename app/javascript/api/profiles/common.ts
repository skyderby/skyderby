import { QueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { recordQueryKey } from './useProfileQuery'
import { countrySchema } from 'api/countries'

export const profileSchema = z.object({
  id: z.number(),
  name: z.string(),
  countryId: z.number().nullable(),
  contributor: z.boolean(),
  photo: z.object({
    original: z.string(),
    medium: z.string(),
    thumb: z.string()
  })
})

export type ProfileRecord = z.infer<typeof profileSchema>

export const profilesIndexSchema = z.object({
  items: z.array(profileSchema),
  relations: z.object({
    countries: z.array(countrySchema)
  }),
  currentPage: z.number(),
  totalPages: z.number()
})

export type ProfilesIndex = z.infer<typeof profilesIndexSchema>

export type IndexParams = {
  search?: string
  page?: number
  perPage?: number
}

export const collectionEndpoint = '/api/v1/profiles'
export const elementEndpoint = (id: number): string => `${collectionEndpoint}/${id}`

export const cacheProfiles = (
  profiles: ProfileRecord[],
  queryClient: QueryClient
): void =>
  profiles
    .filter(profile => !queryClient.getQueryData(recordQueryKey(profile.id)))
    .forEach(profile =>
      queryClient.setQueryData<ProfileRecord>(recordQueryKey(profile.id), profile)
    )
