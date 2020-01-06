import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

export const Container = styled.div`
  align-items: baseline;
  font-family: 'Proxima Nova Regular';
  display: flex;
  justify-content: center;
  margin: 1rem 0;

  > :not(:last-child) {
    margin-right: 1.5rem;
  }
`

export const Arrow = styled.div`
  display: flex;

  svg {
    height: 1.25rem;
    path {
      fill: #999;
    }
  }
`

export const Page = styled(({ active, ...props }) => <Link {...props} />)`
  font-size: 1.75rem;
  padding: 0 0.25rem;
  line-height: 2.5rem;
  color: ${props => (props.active ? '#75A4BA' : '#555')};
  border-bottom: solid 3px ${props => (props.active ? '#75A4BA' : 'transparent')};

  :focus {
    outline: none;
  }
`
