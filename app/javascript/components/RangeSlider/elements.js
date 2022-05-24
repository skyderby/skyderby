import styled from 'styled-components'
import SliderBase from './SliderBase'

export const Container = styled.div`
  padding: 0 1rem;
  width: 100%;
  height: 60px;
  margin-bottom: 1rem;
`

export const Slider = styled(SliderBase)`
  position: relative;
  width: 100%;
  height: 100%;
`

export const Rail = styled.div`
  background-color: #dadada;
  border-radius: var(--border-radius-md);
  height: 12px;
  top: 25px;
  left: -6px;
  right: -6px;
  outline: none;
  position: absolute;
`

export const Handle = styled.div`
  cursor: pointer;
  height: 16px;
  position: absolute;
  top: 23px;
  width: 8px;
  z-index: 2;
  margin-left: -4px;

  ::before {
    background-color: #ed5565;
    content: '';
    display: block;
    height: 100%;
    left: calc(50% - 1px);
    position: absolute;
    width: 2px;
  }
`

export const Track = styled.div`
  background-color: #ed5565;
  height: 12px;
  top: 25px;
  position: absolute;
`

export const SingleValueContainer = styled.div`
  background: #ed5565;
  border-radius: var(--border-radius-md);
  color: #fff;
  font-size: 10px;
  line-height: 1.333;
  padding: 1px 5px;
  position: absolute;
  text-align: center;
  text-shadow: none;
  white-space: nowrap;
  transform: translate(-50%);

  ::after {
    border: 3px solid transparent;
    border-top-color: #ed5565;
    bottom: -6px;
    content: '';
    display: block;
    height: 0;
    left: 50%;
    transform: translate(-3px);
    overflow: hidden;
    position: absolute;
    width: 0;
  }
`

export const MergedValuesContainer = styled.div`
  background: #ed5565;
  border-radius: var(--border-radius-md);
  color: #fff;
  font-size: 10px;
  line-height: 1.333;
  padding: 1px 5px;
  position: absolute;
  text-align: center;
  text-shadow: none;
  white-space: nowrap;
  transform: translate(-50%);

  ::after {
    border: 3px solid transparent;
    border-top-color: #ed5565;
    bottom: -6px;
    content: '';
    display: block;
    height: 0;
    left: calc(50% - 3px);
    overflow: hidden;
    position: absolute;
    width: 0;
  }
`

export const Tick = styled.div`
  color: #999;
  position: absolute;
  top: 40px;
  height: 20px;
  padding-top: 10px;
  font-size: 9px;
  line-height: 9px;
  text-align: center;

  span {
    position: absolute;
    transform: translate(-50%);
    display: ${props => (props.major ? 'block' : 'none')};
  }

  ::after {
    background-color: #e1e4e9;
    content: '';
    display: block;
    height: ${props => (props.major ? '8px' : '5px')};
    width: 1px;
    position: absolute;
    top: 0px;
  }

  &:empty ::after {
    height: 5px;
  }

  &:first-child {
    text-align: right;
  }

  &:last-child {
    text-align: left;
  }
`
