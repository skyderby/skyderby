import React from 'react'
import styled from 'styled-components'

import CloseButton from './CloseButton'

const Header = ({ className, title, handleHide }) => {
  return (
    <div className={className}>
      {title}
      <CloseButton onClick={handleHide} />
    </div>
  )
}

export default styled(Header)`
  display: flex;
  border-bottom: 1px solid #e5e5e5;
  padding: 10px 15px;
`
