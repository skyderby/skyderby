import React, { forwardRef } from 'react'
import '@testing-library/jest-dom/extend-expect'

const mockHighchart = forwardRef(() => {
  return <div>Highchart</div>
})
mockHighchart.displayName = 'HighchartMock'

jest.mock('components/Highchart', () => {
  return mockHighchart
})
