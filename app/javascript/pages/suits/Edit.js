import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import { loadSuit } from 'redux/suits'
import { ForbiddenError } from 'errors'
import usePageStatus from 'hooks/usePageStatus'
import SuitEdit from 'components/SuitEdit'
import PageWrapper from 'components/PageWrapper'

const Edit = ({ match }) => {
  const dispatch = useDispatch()
  const suitId = Number(match.params.id)
  const [status, { onLoadStart, onLoadSuccess, onError }] = usePageStatus({
    linkBack: '/suits'
  })

  useEffect(() => {
    onLoadStart()
    dispatch(loadSuit(suitId))
      .then(({ editable }) => {
        if (!editable) throw new ForbiddenError()
      })
      .then(onLoadSuccess)
      .catch(onError)
  }, [dispatch, suitId, onLoadStart, onLoadSuccess, onError])

  return (
    <PageWrapper {...status}>
      <SuitEdit suitId={suitId} />
    </PageWrapper>
  )
}

Edit.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string.isRequired
    }).isRequired
  }).isRequired
}

export default Edit
