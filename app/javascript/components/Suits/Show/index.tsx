import React from 'react'
import { Routes, Route, Link, useParams } from 'react-router-dom'

import { useSuitQuery } from 'api/suits'
import { useManufacturerQuery } from 'api/manufacturer'
import Breadcrumbs from 'components/ui/Breadcrumbs'
import Overview from './Overview'
import Videos from './Videos'
import Tracks from './Tracks'
import Edit from './Edit'
import Header from './Header'
import styles from './styles.module.scss'

const Show = (): JSX.Element | null => {
  const params = useParams()
  const suitId = Number(params.id)
  const { data: suit } = useSuitQuery(suitId)
  const { data: make } = useManufacturerQuery(suit?.makeId)

  if (!suit || !make) return null

  return (
    <div className={styles.container}>
      <Breadcrumbs>
        <Breadcrumbs.Item>
          <Link to="/suits">Suits</Link>
        </Breadcrumbs.Item>
        <Breadcrumbs.Item>
          <Link to={`/suits/make/${make.id}`}>{make.name}</Link>
        </Breadcrumbs.Item>
        <Breadcrumbs.Item>{suit.name}</Breadcrumbs.Item>
      </Breadcrumbs>

      <Header suit={suit} make={make} />

      <Routes>
        <Route index element={<Overview />} />
        <Route path="edit" element={<Edit suitId={suitId} />} />
        <Route path="videos" element={<Videos />} />
        <Route path="tracks" element={<Tracks />} />
      </Routes>
    </div>
  )
}

export default Show
