import React from 'react'
import styled, { css } from 'styled-components'
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
  color: var(${props => (props.active ? '--blue-40' : '--grey-70')});
  font-family: 'Proxima Nova Semibold';
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  border-radius: var(--border-radius-md);
  outline: none;
  padding: 0.5rem 0.5rem;
  position: relative;

  :not(:last-child) {
    margin-right: 0.25rem;
  }

  :hover,
  :focus {
    color: var(${props => (props.active ? '--blue-40' : '--grey-70')});
  }

  :focus {
    outline: none;
  }

  ${props =>
    !props.active &&
    css`
      :hover,
      :focus {
        background-color: var(--grey-20);
      }
    `}

  ${props =>
    props.active &&
    css`
      ::after {
        content: '';
        display: block;
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background-color: var(--blue-40);
        opacity: 0.9;
      }
    `}
`
