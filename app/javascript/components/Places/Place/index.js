import React from 'react'
import { Route, Switch } from 'react-router-dom'
import PropTypes from 'prop-types'

import { usePlaceQuery } from 'api/hooks/places'
import Loading from 'components/PageWrapper/Loading'
import Header from './Header'
import Overview from './Overview'
import Videos from './Videos'
import styles from './styles.module.scss'

const Place = ({ match }) => {
  const id = Number(match.params.id)
  const { data: place, isLoading } = usePlaceQuery(id)

  if (isLoading) return <Loading />

  return (
    <div className={styles.container}>
      <Header place={place} />

      <Switch>
        <Route exact path="/places/:id" component={Overview} />
        <Route path="/places/:id/videos" component={Videos} />
        <Route path="/places/:id/tracks" component={<div />} />
        <Route path="/places/:id/edit" component={<div />} />
      </Switch>
    </div>
  )
}

Place.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
}

export default Place
