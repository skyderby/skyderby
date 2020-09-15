import React, { forwardRef } from 'react'

const mockHighchart = forwardRef(() => {
  return <div>Highchart</div>
})
mockHighchart.displayName = 'HighchartMock'

jest.mock('components/Highchart', () => {
  return mockHighchart
})
