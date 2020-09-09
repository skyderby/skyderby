import styled, { keyframes } from 'styled-components'

const rotate = keyframes`
  0%   { transform:rotate(0) }
  50%  { transform:rotate(180deg) }
  100% { transform:rotate(360deg) }
`

export const Container = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`

export const Caption = styled.div`
  color: var(--blue-40);
  font-family: 'Proxima Nova Semibold';
  font-size: 1.5rem;
`

export const Spinner = styled.div`
  position: relative;
  height: 40px;
`

export const Outer = styled.div`
  position: absolute;
  left: -20px;
  top: -20px;
  border: 2px solid var(--blue-40);
  border-bottom-color: transparent;
  border-top-color: transparent;
  border-radius: 100%;
  height: 35px;
  width: 35px;
  animation: ${rotate} 1s 0s linear infinite;
`

export const Inner = styled(Outer)`
  display: inline-block;
  top: -10px;
  left: -10px;
  width: 15px;
  height: 15px;
  animation-duration: 0.5s;
  border-color: var(--blue-40) transparent;
  animation-direction: reverse;
`
