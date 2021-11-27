import React from 'react'
import { rest } from 'msw'
import type { Story } from '@storybook/react'

import VideoThumbnail from './'
import { VideoRecord } from 'api/tracks/video'
import CoverImage from './stories/mqdefault.jpg'

const video: VideoRecord = {
  trackId: 1,
  url: 'https://www.youtube.com/watch?v=uYZjcIzv9CU',
  videoCode: 'uYZjcIzv9CU',
  trackOffset: 5,
  videoOffset: 3
}

export default {
  title: 'components/VideoThumbnail',
  component: VideoThumbnail,
  decorators: [
    (Story: Story) => (
      <div style={{ padding: '2rem', width: '35%' }}>
        <Story />
      </div>
    )
  ]
}

export const Default = () => <VideoThumbnail video={video} />

Default.parameters = {
  msw: [
    rest.get('/api/v1/tracks/1', (req, res, ctx) =>
      res(
        ctx.json({
          placeId: 100,
          suitId: 200,
          profileId: 3,
          recordedAt: '2015-02-28T15:00:00Z',
          relations: {
            suits: [{ id: 200, name: 'Home made', category: 'tracksuit', makeId: 1 }],
            manufacturers: [{ id: 1, name: 'Sewer', code: 'SW' }],
            profiles: [{ id: 3, name: 'Shane', countryId: null }],
            places: [
              {
                id: 100,
                name: 'Gridset',
                kind: 'base',
                latitude: 62.5,
                longitude: 7.57,
                countryId: 1
              }
            ],
            countries: [{ id: 1, name: 'Norway', code: 'NOR' }]
          }
        })
      )
    ),
    rest.get(
      'https://img.youtube.com/vi/uYZjcIzv9CU/mqdefault.jpg',
      async (req, res, ctx) => {
        const image = await fetch(CoverImage).then(res => res.arrayBuffer())
        return res(
          ctx.set('Content-Length', image.byteLength.toString()),
          ctx.set('Content-Type', 'image/png'),
          ctx.body(image)
        )
      }
    )
  ]
}
