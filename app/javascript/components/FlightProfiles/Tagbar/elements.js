import styled from 'styled-components'

export const Container = styled.div`
  padding: 0 1rem 0 2rem;
  overflow-y: hidden;
`

export const TagList = styled.ul`
  background-color: #fff;
  display: flex;
  padding: 0 0 2rem;
  margin: 0;
  overflow-x: auto;

  > :not(:last-child) {
    margin-right: 0.5rem;
  }
`

export const Tag = styled.li`
  flex-shrink: 0;
  border-radius: var(--border-radius-sm);
  color: var(--grey-70);
  background-color: var(--grey-10);
`

export const DeleteButton = styled.button`
  background-color: transparent;
  border: 0;
  border-radius: var(--border-radius-sm);
  outline: none;
  padding: 0.25rem 0.5rem;

  svg {
    height: 0.75em;
    fill: rgba(0, 0, 0, 0.55);
  }

  &:hover {
    background-color: var(--grey-30);

    svg {
      fill: rgba(0, 0, 0, 0.85);
    }
  }
`

export const Label = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
`
