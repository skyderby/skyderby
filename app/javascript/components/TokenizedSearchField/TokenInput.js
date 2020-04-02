import React, { forwardRef } from 'react'

import { SearchInput } from './elements'

const TokenInput = forwardRef((props, ref) => {
  return (
    <li>
      <SearchInput ref={ref} type="text" {...props} />
    </li>
  )
})

TokenInput.displayName = 'TokenInput'

export default TokenInput
