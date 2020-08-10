import styled from 'styled-components'

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

  ${Type} {
    background-color: rgba(var(--token-color), var(--type-alpha));
  }
  ${Value} {
    background-color: rgba(var(--token-color), var(--value-alpha));
  }
`

export const PlaceContainer = styled(Container)`
  --token-color: 160, 230, 210;
`

export const ProfileContainer = styled(Container)`
  --token-color: 160, 210, 230;
`

export const SuitContainer = styled(Container)`
  --token-color: 230, 210, 160;
`
