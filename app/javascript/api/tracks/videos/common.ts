import { z } from 'zod'

export const videoSchema = z.object({
  trackId: z.number(),
  url: z.string(),
  videoCode: z.string(),
  videoOffset: z.number(),
  trackOffset: z.number()
})

export type TrackVideo = z.infer<typeof videoSchema>

export type QueryKey = ['trackVideo', number]

export const queryKey = (id: number): QueryKey => ['trackVideo', id]

export const videoUrl = (id: number): string => `/api/v1/tracks/${id}/video`
