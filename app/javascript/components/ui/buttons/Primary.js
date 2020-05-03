import styled from 'styled-components'

import DefaultButton from './Default'

export default styled(DefaultButton)`
  background-color: var(--green-40);
  border-color: var(--green-40);
  color: #fff;

  &:hover {
    background-color: var(--green-50);
    border-color: var(--green-50);
    color: #fff;
  }
`
