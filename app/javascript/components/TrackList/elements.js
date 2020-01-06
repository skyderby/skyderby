import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

import { devices } from 'styles/devices'

export const Container = styled.div`
  width: 100%;
  margin: 2rem auto;
  padding: 0 1rem;

  @media ${devices.large} {
    width: 1200px;
  }
`

export const Header = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
`

export const Title = styled.h1`
  font-family: 'Proxima Nova Bold';
  font-size: 2rem;
  letter-spacing: 1px;
  margin: 0;
`

export const ActivityLink = styled(({ active, ...props }) => <Link {...props} />)`
  color: ${props => (props.active ? '#75A4BA' : '#999')};
  font-family: 'Proxima Nova Semibold';
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  border-bottom: solid 3px ${props => (props.active ? '#75A4BA' : 'transparent')};
  outline: none;

  :not(:last-child) {
    margin-right: 0.75rem;
  }

  :hover,
  :focus {
    color: #75a4ba;
  }

  :focus {
    outline: none;
  }
`
