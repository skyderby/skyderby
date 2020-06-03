import styled, { css } from 'styled-components'

export const Type = styled.div`
  border-radius: 2px 0 0 2px;
  color: rgba(0, 0, 0, 0.55);
  padding: 2px 7px;
  text-transform: capitalize;
`

export const Value = styled.div`
  color: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  border-radius: 0 2px 2px 0;
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

export const Container = styled.li`
  cursor: pointer;
  display: flex;

  --token-color: 230, 230, 230;
  --type-alpha: 0.55;
  --value-alpha: 0.75;

  :hover {
    --type-alpha: 0.8;
    --value-alpha: 1;
  }

  > :not(:last-child) {
    margin-right: 1px;
  }

  ${props => {
    switch (props.color) {
      case 'blue':
        return css`
          --token-color: 160, 210, 230;
        `
      case 'yellow':
        return css`
          --token-color: 230, 210, 160;
        `
      case 'green':
        return css`
          --token-color: 160, 230, 210;
        `
    }
  }}

  ${Type} {
    background-color: rgba(var(--token-color), var(--type-alpha));
  }
  ${Value} {
    background-color: rgba(var(--token-color), var(--value-alpha));
  }
`
