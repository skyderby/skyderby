import styled from 'styled-components'
import { devices } from 'styles/devices'

export const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 48%);
  grid-gap: 1rem;
  justify-content: space-around;
  margin-bottom: 1rem;

  > [value='distance'],
  [value='elevation'] {
    display: none;
  }

  @media ${devices.small} {
    grid-template-columns: repeat(3, fit-content(25%));
    justify-content: space-evenly;

    > [value='distance'],
    [value='elevation'] {
      display: block;
    }
  }
`

export const SummaryItem = styled.div`
  overflow: hidden;

  &[value='glide-ratio'] {
    grid-column: 1;
    grid-row: 1;

    @media ${devices.small} {
      grid-column: 3;
      grid-row: 1;
    }
  }

  &[value='ground-speed'] {
    grid-column: 2;
    grid-row: 1;

    @media ${devices.small} {
      grid-column: 2;
      grid-row: 1;
    }
  }

  &[value='time'] {
    grid-column: 1;
    grid-row: 2;

    @media ${devices.small} {
      grid-column: 3;
      grid-row: 2;
    }
  }

  &[value='vertical-speed'] {
    grid-column: 2;
    grid-row: 2;

    @media ${devices.small} {
      grid-column: 2;
      grid-row: 2;
    }
  }

  &[value='distance'] {
    grid-column: 1;
    grid-row: 3;

    @media ${devices.small} {
      grid-column: 1;
      grid-row: 1;
    }
  }

  &[value='elevation'] {
    grid-column: 2;
    grid-row: 3;

    @media ${devices.small} {
      grid-column: 1;
      grid-row: 2;
    }
  }
`

export const Title = styled.div`
  color: var(--grey-40);
  font-family: 'Proxima Nova Semibold';
  text-transform: uppercase;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const ValueContainer = styled.div`
  align-items: baseline;
  color: var(--grey-80);
  display: flex;
  font-family: 'Proxima Nova Thin';
  white-space: nowrap;

  > :not(:last-child) {
    margin-right: 0.5rem;
  }
`

export const Value = styled.div`
  font-size: 2.5rem;

  @media ${devices.small} {
    font-size: 3rem;
  }
`

export const Units = styled.div`
  font-size: 1.75rem;

  @media ${devices.small} {
    font-size: 2rem;
  }
`

export const WindEffect = styled.div`
  display: flex;
  flex-wrap: wrap;
`

export const WindEffectRail = styled.div`
  display: flex;
  flex-basis: 100%;
  height: 3px;

  ::before {
    content: '';
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
    display: block;
    background-color: #00ba65;
    width: ${props => 100 - props.effect}%;
    height: 2px;
  }

  ::after {
    content: '';
    display: block;
    background-color: #ff777c;
    width: ${props => props.effect}%;
    height: 2px;
  }
`

export const ZeroWindValue = styled.div`
  flex-basis: 50%;
  color: #1fbe78;
`

export const WindEffectValue = styled.div`
  flex-basis: 50%;
  color: #ff777c;
  text-align: right;
`

export const MinMaxValue = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  align-self: center;
`

export const Max = styled.div`
  display: flex;
  align-items: end;
  > * {
    margin-right: 0.25rem;
  }

  span {
    color: #1fbe78;
  }

  svg {
    height: 1rem;

    path {
      fill: #1fbe78;
    }
  }
`

export const Min = styled.div`
  display: flex;
  align-items: center;
  > * {
    margin-right: 0.25rem;
  }

  span {
    color: #ff777c;
  }

  svg {
    height: 1rem;

    path {
      fill: #ff777c;
    }
  }
`
