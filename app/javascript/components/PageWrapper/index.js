import React from 'react'
import PropTypes from 'prop-types'

import ErrorPlaceholder from 'components/ErrorPage'
import Loading from './Loading'

const PageWrapper = ({ isLoading, error, status, children, ...props }) => {
  if (isLoading || status === 'loading') return <Loading />

  if (error || status === 'error') return <ErrorPlaceholder {...error} {...props} />

  return children
}

PageWrapper.propTypes = {
  error: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    linkBack: PropTypes.string
  }),
  status: PropTypes.oneOf(['idle', 'loading', 'success', 'error']).isRequired,
  children: PropTypes.node
}

export default PageWrapper
