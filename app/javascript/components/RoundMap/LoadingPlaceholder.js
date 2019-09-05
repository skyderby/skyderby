import { h } from 'preact'
import styled from 'styled-components'

const LoadingPlaceholder = ({ className }) => (
  <div className={className}>
    <p>
      <i className="fa fa-spin fa-circle-notch" />
    </p>
    <p>
      <span>Loading...</span>
    </p>
  </div>
)

export default styled(LoadingPlaceholder)`
  color: #777;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: auto;
  margin-right: auto;
  padding-bottom: 10vh;
  text-align: center;

  p {
    margin: 0;
  }

  i {
    font-size: 48px;
  }

  span {
    line-height: 2.5;
    font-size: 32px;
  }
`
