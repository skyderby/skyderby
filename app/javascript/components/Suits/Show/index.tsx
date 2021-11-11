import React from 'react'
import { Switch, Route, Link, match } from 'react-router-dom'

import { useSuitQuery } from 'api/suits'
import { useManufacturerQuery } from 'api/manufacturer'
import Breadcrumbs from 'components/ui/Breadcrumbs'
import Overview from './Overview'
import Videos from './Videos'
import Tracks from './Tracks'
import Edit from './Edit'
import Header from './Header'
import styles from './styles.module.scss'

type ShowProps = {
  match: match<{ id: string }>
}

const Show = ({ match }: ShowProps): JSX.Element | null => {
  const suitId = Number(match.params.id)
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

      <Switch>
        <Route exact path="/suits/:id" component={Overview} />
        <Route path="/suits/:id/edit" component={Edit} />
        <Route path="/suits/:id/videos" component={Videos} />
        <Route path="/suits/:id/tracks" component={Tracks} />
      </Switch>
    </div>
  )
}

export default Show
