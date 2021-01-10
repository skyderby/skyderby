import React from 'react'
import { Link } from 'react-router-dom'

import Breadcrumbs from './'

export default {
  title: 'components/Breadcrumbs',
  component: Breadcrumbs,
  decorators: [story => <div style={{ padding: '2rem' }}>{story()}</div>]
}

export const SingleEntry = () => (
  <Breadcrumbs>
    <Breadcrumbs.Item>
      <Link to="/suits">Suits</Link>
    </Breadcrumbs.Item>
  </Breadcrumbs>
)

export const ManyEntries = () => (
  <Breadcrumbs>
    <Breadcrumbs.Item>
      <Link to="/suits">Suits</Link>
    </Breadcrumbs.Item>
    <Breadcrumbs.Item>
      <Link to="/suits/123">Tonysuits</Link>
    </Breadcrumbs.Item>
    <Breadcrumbs.Item>
      <Link to="/suits/123">Nala</Link>
    </Breadcrumbs.Item>
  </Breadcrumbs>
)
