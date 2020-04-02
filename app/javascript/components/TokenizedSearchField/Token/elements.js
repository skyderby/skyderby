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

  > :not(:last-child) {
    margin-right: 1px;
  }

  ${props => {
    switch (props.type) {
      case 'profile':
        return css`
          ${Type} {
            background-color: rgba(160, 210, 230, 0.55);
          }

          ${Value} {
            background-color: rgba(160, 210, 230, 0.75);
          }

          &:hover {
            ${Type} {
              background-color: rgba(160, 210, 230, 0.8);
            }

            ${Value} {
              background-color: rgba(160, 210, 230, 1);
            }
          }
        `
      case 'suit':
        return css`
          ${Type} {
            background-color: rgba(230, 210, 160, 0.55);
          }

          ${Value} {
            background-color: rgba(230, 210, 160, 0.75);
          }

          &:hover {
            ${Type} {
              background-color: rgba(230, 210, 160, 0.8);
            }

            ${Value} {
              background-color: rgba(230, 210, 160, 1);
            }
          }
        `
      case 'place':
        return css`
          ${Type} {
            background-color: rgba(160, 230, 210, 0.55);
          }

          ${Value} {
            background-color: rgba(160, 230, 210, 0.75);
          }

          &:hover {
            ${Type} {
              background-color: rgba(160, 230, 210, 0.8);
            }

            ${Value} {
              background-color: rgba(160, 230, 210, 1);
            }
          }
        `
      default:
        return css`
          ${Type} {
            background-color: #f8f8f8;
          }
          ${Value} {
            background-color: #f0f0f0;
          }

          &:hover {
            ${Type} {
              background-color: #ebebeb;
            }
            ${Value} {
              background-color: #dadada;
            }
          }
        `
    }
  }}
`
