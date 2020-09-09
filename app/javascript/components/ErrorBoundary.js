import React from 'react'
import PropTypes from 'prop-types'
import Honeybadger from 'honeybadger-js/honeybadger'

Honeybadger.configure({
  apiKey: window.HB_API_KEY,
  environment: window.ENVIRONMENT_NAME
})

class PageErrorBoundary extends React.Component {
  componentDidCatch(error) {
    Honeybadger.notify(error)
  }

  render() {
    return this.props.children
  }
}

PageErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
}

export default PageErrorBoundary
