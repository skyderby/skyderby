import React from 'react'
import styled from 'styled-components'

const List = ({ className, children }) => {
  return <div className={className}>{children}</div>
}

export default styled(List)`
  border-left: #ccc 2px solid;
`
