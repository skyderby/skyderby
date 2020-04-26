import styled from 'styled-components'

export const TagList = styled.ul`
  background-color: #fff;
  display: flex;
  padding: 0.5rem 0.75rem;
  margin: 0;

  > :not(:last-child) {
    margin-right: 0.5rem;
  }
`

export const Tag = styled.li`
  border-radius: 2px;
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
