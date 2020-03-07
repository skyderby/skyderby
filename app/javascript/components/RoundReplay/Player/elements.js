import styled from 'styled-components'
import { devices } from 'styles/devices'

export const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 0 15px;

  > :not(:last-child) {
    margin-bottom: 15px;
  }

  @media ${devices.small} {
    > :not(:last-child) {
      margin-bottom: 0;
    }
  }
`
