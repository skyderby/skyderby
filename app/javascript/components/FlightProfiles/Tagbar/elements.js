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
  color: rgba(0, 0, 0, 0.55);
  background-color: #f8f8f8;
  padding: 2px 0 2px 7px;
`

export const DeleteButton = styled.button`
  border: 0;
  background-color: transparent;
  outline: none;
  padding: 0 7px;

  svg {
    height: 0.75em;
    fill: rgba(0, 0, 0, 0.55);
  }

  &:hover {
    svg {
      fill: rgba(0, 0, 0, 0.85);
    }
  }
`

export const Label = styled.span``
