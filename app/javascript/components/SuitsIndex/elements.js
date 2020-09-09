import styled from 'styled-components'

export const Container = styled.div`
  display: grid;
  grid-template-columns: 320px minmax(350px, 1fr);
  grid-gap: 1rem;
  padding: 1rem;
`

export const Content = styled.div`
  background-color: var(--white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--block-box-shadow);
  padding: 1rem;
  width: 100%;
`
