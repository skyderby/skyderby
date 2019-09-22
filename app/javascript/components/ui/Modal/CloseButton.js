import React from 'react'
import styled from 'styled-components'

const CloseButton = props => <button {...props}> × </button>

export default styled(CloseButton)`
  background-color: transparent;
  border: 0;
  color: #000;
  cursor: pointer;
  font-size: 21px;
  font-weight: bold;
  line-height: 1;
  margin-left: auto;
  margin-top: -2px;
  padding: 0;
  text-shadow: 0 1px 0 #fff;
  opacity: 0.2;

  &:hover {
    opacity: 0.5;
  }
`
