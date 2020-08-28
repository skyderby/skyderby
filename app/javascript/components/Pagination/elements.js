import React from 'react'
import styled, { css } from 'styled-components'
import { Link } from 'react-router-dom'

export const Container = styled.div`
  align-items: baseline;
  font-family: 'Proxima Nova Light';
  display: flex;
  justify-content: center;
  margin: 1rem 0;

  > :not(:last-child) {
    margin-right: 0.75rem;
  }
`

export const Arrow = styled.div`
  display: flex;

  svg {
    height: 1rem;
    path {
      fill: #999;
    }
  }
`

export const Page = styled(({ active, ...props }) => <Link {...props} />)`
  border-radius: var(--border-radius-md);
  color: var(${props => (props.active ? '--blue-40' : '--grey-80')});
  font-size: 1.75rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  padding: 0 0.75rem;
  position: relative;

  :focus {
    outline: none;
  }

  :hover {
    color: var(${props => (props.active ? '--blue-40' : '--grey-80')});
  }

  ${props =>
    !props.active &&
    !props.disabled &&
    css`
      :hover {
        background-color: var(--grey-20);
      }
    `}

  ${props =>
    props.active &&
    css`
      ::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0.25rem;
        right: 0.25rem;
        height: 3px;
        background-color: var(--blue-40);
        opacity: 0.9;
      }
    `}
`
