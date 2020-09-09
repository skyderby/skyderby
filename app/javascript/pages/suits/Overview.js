import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import Api from 'api'
import { loadAllSuits } from 'redux/suits'
import { selectAllManufacturers } from 'redux/manufacturers'
import usePageStatus from 'hooks/usePageStatus'
import PageWrapper from 'components/PageWrapper'
import SuitsIndex from 'components/SuitsIndex'
import SuitsOverview from 'components/SuitsOverview'

const Overview = () => {
  const dispatch = useDispatch()
  const allManufacturers = useSelector(selectAllManufacturers)
  const [status, { onLoadStart, onLoadSuccess, onError }] = usePageStatus({
    linkBack: '/'
  })

  const [popularity, setPopularity] = useState([])

  useEffect(() => {
    onLoadStart()
    Promise.all([
      dispatch(loadAllSuits()),
      Api.Suit.Popularity.findAll().then(setPopularity)
    ])
      .then(onLoadSuccess)
      .catch(onError)
  }, [dispatch, setPopularity, onLoadStart, onLoadSuccess, onError])

  return (
    <PageWrapper {...status}>
      <SuitsIndex>
        <SuitsOverview allManufacturers={allManufacturers} popularity={popularity} />
      </SuitsIndex>
    </PageWrapper>
  )
}

export default Overview
