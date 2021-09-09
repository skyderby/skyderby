import React from 'react'
import Honeybadger from 'honeybadger-js'

Honeybadger.configure({
  apiKey: window.HB_API_KEY ?? '',
  environment: window.ENVIRONMENT_NAME
})

type PageErrorBoundaryProps = {
  children: React.ReactNode | React.ReactNode[]
}

class PageErrorBoundary extends React.Component<PageErrorBoundaryProps> {
  componentDidCatch(error: Error): void {
    Honeybadger.notify(error)
  }

  render(): React.ReactNode {
    return this.props.children
  }
}

export default PageErrorBoundary
