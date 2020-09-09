import styled from 'styled-components'
import { devices } from 'styles/devices'

export const Container = styled.div`
  background-color: var(--white);
  padding: 4rem 2rem;
  text-align: center;
  width: 100%;
  margin: 4rem auto;
  box-shadow: var(--block-box-shadow);

  @media ${devices.small} {
    max-width: 768px;
    padding: 4rem;
    border-radius: var(--border-radius-lg);
  }
`

export const Title = styled.h1`
  color: var(--grey-60);
  font-family: 'Proxima Nova Bold';
  font-size: 5rem;
  margin: 0;
  padding: 0;
`

export const Description = styled.p`
  font-family: 'Proxima Nova Semibold';
  font-size: 2rem;
`
