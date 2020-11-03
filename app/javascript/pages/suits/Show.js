import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import { loadSuit } from 'redux/suits'
import usePageStatus from 'hooks/usePageStatus'
import AppShell from 'components/AppShell'
import SuitShow from 'components/SuitShow'
import PageWrapper from 'components/PageWrapper'

const Show = ({ match }) => {
  const dispatch = useDispatch()
  const suitId = Number(match.params.id)
  const [status, { onLoadStart, onLoadSuccess, onError }] = usePageStatus({
    linkBack: '/suits'
  })

  useEffect(() => {
    onLoadStart()
    dispatch(loadSuit(suitId)).then(onLoadSuccess).catch(onError)
  }, [dispatch, suitId, onLoadStart, onLoadSuccess, onError])

  return (
    <AppShell>
      <PageWrapper {...status}>
        <SuitShow suitId={suitId} />
      </PageWrapper>
    </AppShell>
  )
}

Show.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
}

export default Show
