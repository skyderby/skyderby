import styled from 'styled-components'
import { devices, sizes } from 'styles/devices'

export const Container = styled.div`
  display: grid;
  grid-gap: 1rem;
  width: 100%;
  margin: 0 auto;

  @media ${devices.small} {
    padding: 1rem 0;
    width: ${sizes.small};
  }
`
