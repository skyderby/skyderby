import React from 'react'
import PropTypes from 'prop-types'

import ErrorPlaceholder from 'components/ErrorPlaceholder'
import Loading from './Loading'

const PageWrapper = ({ error, status, children, ...props }) => {
  if (status === 'loading') return <Loading />

  if (status === 'error') return <ErrorPlaceholder {...error} {...props} />

  return children
}

PageWrapper.propTypes = {
  error: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    linkBack: PropTypes.string
  }),
  status: PropTypes.oneOf(['idle', 'loading', 'error']).isRequired,
  children: PropTypes.node
}

export default PageWrapper
