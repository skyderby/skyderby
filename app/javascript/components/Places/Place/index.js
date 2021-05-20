import React from 'react'
import { usePlaceQuery } from 'api/hooks/places'
import PropTypes from 'prop-types'

import Loading from 'components/PageWrapper/Loading'
import Header from './Header'

const Place = ({ match }) => {
  const id = Number(match.params.id)
  const { data: place, isLoading } = usePlaceQuery(id)

  if (isLoading) return <Loading />

  return (
    <div>
      <Header place={place} />
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
