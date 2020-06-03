import React from 'react'
import { useSelector } from 'react-redux'

import { usePageContext } from 'components/PageContext'
import { selectPagination } from 'redux/tracks/tracksIndex'
import Pagination from 'components/Pagination'
import ActivitySelect from './ActivitySelect'
import Filters from './Filters'
import List from './List'
import { Container, Header, Title } from './elements'

const TrackList = () => {
  const { params, buildUrl } = usePageContext()
  const paginationOptions = useSelector(selectPagination)

  return (
    <Container>
      <Header>
        <Title>Tracks</Title>
        <ActivitySelect buildUrl={buildUrl} currentActivity={params.activity} />
      </Header>

      <Filters urlBuilder={buildUrl} />

      <List />

      <Pagination buildUrl={buildUrl} showAround={3} {...paginationOptions} />
    </Container>
  )
}

export default TrackList
