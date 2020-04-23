import styled from 'styled-components'

import { devices } from 'styles/devices'

const borderColor = '#e0e0e0'

export const Container = styled.div`
  background-color: #fff;
  font-family: 'Proxima Nova Regular';
  width: 100%;
  padding: 1rem;
  border: solid 1px transparent;
  border-top-color: ${borderColor};
  border-bottom-color: ${borderColor};

  @media ${devices.large} {
    border-left-color: ${borderColor};
    border-right-color: ${borderColor};
  }
`

export const Section = styled.div`
  display: flex;
  flex-wrap: wrap;

  :not(:last-child) {
    margin-bottom: 2rem;
  }

  @media ${devices.small} {
    flex-wrap: nowrap;
  }
`

export const Description = styled.div`
  width: 100%;

  h2 {
    margin: 0;
    font-size: 1.25rem;
    line-height: 2.125rem;
  }

  @media ${devices.small} {
    width: 30%;
  }
`

export const Controls = styled.div`
  width: 100%;

  @media ${devices.small} {
    width: 70%;
  }
`

export const Footer = styled.div`

`
