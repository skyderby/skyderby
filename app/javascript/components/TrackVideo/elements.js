import styled from 'styled-components'

export const IndicatorsContainer = styled.div`
  display: flex;
  width: 100%;
`

export const ValueContainer = styled.div`
  display: flex;
  flex-basis: 0;
  flex-grow: 1;
  flex-shrink: 1;
  flex-direction: column;
  text-align: center;

  :not(:last-child) {
    margin-right: 1rem;
  }
`

export const Value = styled.div`
  color: var(--grey-80);
  font-family: 'Proxima Nova Thin';
  font-size: 2.5rem;
`

export const Title = styled.div`
  color: var(--grey-40);
  font-family: 'Proxima Nova Semibold';
  text-transform: uppercase;
`
