import React from 'react'
import styled, { keyframes } from 'styled-components'

const Container = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  font-size: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--grey-40);
  text-align: center;
  vertical-align: middle;
`

const animation = keyframes`
  0%, 80%, 100% { opacity: 0; }
  40% { opacity: 1; }
`

const Dot = styled.span`
  animation: ${animation} 1s ease-in-out ${props => props.delay}ms infinite;
  background: currentColor;
  display: inline-block;
  height: 1em;
  width: 1em;

  :not(:last-child) {
    margin-right: 0.5em;
  }
`

const LoadingIndicator = () => {
  return (
    <Container>
      <Dot delay={0} />
      <Dot delay={160} />
      <Dot delay={320} />
    </Container>
  )
}

export default LoadingIndicator
