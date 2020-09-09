import React from 'react'
import { useSelector } from 'react-redux'
import { Switch, Route, Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import { createSuitSelector } from 'redux/suits'
import { createManufacturerSelector } from 'redux/manufacturers'
import SuitOverview from 'components/SuitOverview'
import SuitVideos from 'components/SuitVideos'
import SuitTracks from 'components/SuitTracks'
import Breadcrumbs from 'components/ui/Breadcrumbs'

import Header from './Header'
import { Container } from './elements'

const SuitShow = ({ suitId }) => {
  const suit = useSelector(createSuitSelector(suitId))
  const make = useSelector(createManufacturerSelector(suit?.makeId))

  if (!suit || !make) return null

  return (
    <Container>
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
        <Route exact path="/suits/:id" component={SuitOverview} />
        <Route path="/suits/:id/videos" component={SuitVideos} />
        <Route path="/suits/:id/tracks" component={SuitTracks} />
      </Switch>
    </Container>
  )
}

SuitShow.propTypes = {
  suitId: PropTypes.number.isRequired
}

export default SuitShow
