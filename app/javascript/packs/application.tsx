import React from 'react'
import { createRoot } from 'react-dom/client'

import App from 'components/App'
import useRoot from 'hooks/useRoot'

document.addEventListener('DOMContentLoaded', () => {
  const root = createRoot(useRoot('root'))
  root.render(<App />)
})
