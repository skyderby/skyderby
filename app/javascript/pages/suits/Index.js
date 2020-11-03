import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import { loadAllSuits } from 'redux/suits'
import { loadUsageStats } from 'redux/suits/usageStats'
import { createManufacturerSelector } from 'redux/manufacturers'
import { createSuitsByMakeSelector, selectUsageStats } from 'redux/suits'
import usePageStatus from 'hooks/usePageStatus'
import AppShell from 'components/AppShell'
import PageWrapper from 'components/PageWrapper'
import SuitsIndex from 'components/SuitsIndex'
import MakeSuits from 'components/MakeSuits'

const Index = ({ match }) => {
  const dispatch = useDispatch()
  const makeId = Number(match.params.id)
  const [status, { onLoadStart, onLoadSuccess, onError }] = usePageStatus({
    linkBack: '/suits'
  })

  const manufacturer = useSelector(createManufacturerSelector(makeId))
  const suits = useSelector(createSuitsByMakeSelector(makeId))
  const stats = useSelector(selectUsageStats)

  useEffect(() => {
    onLoadStart()
    dispatch(loadAllSuits()).then(onLoadSuccess).catch(onError)
  }, [dispatch, onLoadStart, onLoadSuccess, onError])

  useEffect(() => {
    dispatch(loadUsageStats(suits.map(el => el.id)))
  }, [dispatch, suits])

  if (!manufacturer) return null

  return (
    <AppShell>
      <PageWrapper {...status}>
        <SuitsIndex>
          <MakeSuits manufacturer={manufacturer} suits={suits} stats={stats} />
        </SuitsIndex>
      </PageWrapper>
    </AppShell>
  )
}

Index.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
}

export default Index
