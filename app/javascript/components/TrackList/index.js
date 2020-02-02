import React from 'react'
import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { selectPagination } from 'redux/tracks/tracksIndex'
import Pagination from 'components/Pagination'
import ActivitySelect from './ActivitySelect'
import Filters from './Filters'
import List from './List'
import { Container, Header, Title } from './elements'

const TrackList = () => {
  const paginationOptions = useSelector(selectPagination)

  const location = useLocation()
  const urlParams = Object.fromEntries(new URLSearchParams(location.search))

  const urlBuilder = params => {
    const newParams = { ...urlParams, ...params }

    return (
      '?' +
      Object.entries(newParams)
        .filter(([_key, value]) => value)
        .map(([key, value]) => `${key}=${value}`)
        .join('&')
    )
  }

  return (
    <Container>
      <Header>
        <Title>Tracks</Title>
        <ActivitySelect urlBuilder={urlBuilder} />
      </Header>

      <Filters urlBuilder={urlBuilder} />

      <List />

      <Pagination urlBuilder={urlBuilder} showAround={3} {...paginationOptions} />
    </Container>
  )
}

export default TrackList
