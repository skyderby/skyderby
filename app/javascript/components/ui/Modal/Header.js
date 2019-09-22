import React from 'react'
import styled from 'styled-components'

import CloseButton from './CloseButton'

const Header = ({ className, handleHide }) => {
  return (
    <div className={className}>
      Header
      <CloseButton onClick={handleHide} />
    </div>
  )
}

export default styled(Header)`
  display: flex;
  border-bottom: 1px solid #e5e5e5;
  padding: 15px;
`
