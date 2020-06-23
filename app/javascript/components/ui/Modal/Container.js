import styled from 'styled-components'

export default styled.div`
  background-color: white;
  border-radius: var(--border-radius-md);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  min-width: 400px;
  max-width: 80vw;
  width: ${props => {
    switch (props.size) {
      case 'sm':
        return '500px'
      case 'md':
        return '760px'
      case 'lg':
        return '960px'
    }
  }};
`
