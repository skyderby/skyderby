import React from 'react'
import type { Story } from '@storybook/react'

import Pagination from './'

export default {
  title: 'components/Pagination',
  component: Pagination,
  decorators: [
    (Story: Story) => (
      <div style={{ padding: '2rem' }}>
        <Story />
      </div>
    )
  ]
}

export const Default = () => (
  <Pagination buildUrl={({ page }) => `?page=${page}`} page={3} totalPages={7} />
)
