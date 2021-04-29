import React from 'react'
import PropTypes from 'prop-types'

export default {
  title: 'Colors'
}

const Row = props => <div style={{ display: 'flex' }} {...props} />
const Block = ({ color, inverse, ...props }) => (
  <div
    style={{
      backgroundColor: color,
      border: '1px solid #999',
      color: inverse ? '#fff' : '#000',
      display: 'flex',
      height: '5rem',
      width: '7rem',
      marginRight: '0.5rem',
      marginBottom: '0.5rem',
      alignItems: 'flex-end',
      justifyContent: 'center'
    }}
    {...props}
  />
)

Block.propTypes = { color: PropTypes.string, inverse: PropTypes.bool }

export const Colors = () => (
  <div style={{ padding: '1rem' }}>
    <h2>Colors</h2>

    <Row>
      <Block color={'var(--grey-90)'} inverse>
        grey-90
      </Block>
      <Block color={'var(--grey-80)'} inverse>
        grey-80
      </Block>
      <Block color={'var(--grey-70)'} inverse>
        grey-70
      </Block>
      <Block color={'var(--grey-60)'} inverse>
        grey-60
      </Block>
      <Block color={'var(--grey-40)'}>grey-40</Block>
      <Block color={'var(--grey-30)'}>grey-30</Block>
      <Block color={'var(--grey-20)'}>grey-20</Block>
      <Block color={'var(--grey-10)'}>grey-10</Block>
    </Row>

    <Row>
      <Block color={'var(--blue-grey-90)'} inverse>
        blue-grey-90
      </Block>
      <Block color={'var(--blue-grey-80)'} inverse>
        blue-grey-80
      </Block>
      <Block color={'var(--blue-grey-70)'} inverse>
        blue-grey-70
      </Block>
      <Block color={'var(--blue-grey-60)'} inverse>
        blue-grey-60
      </Block>
    </Row>

    <Row>
      <Block color={'var(--blue-90)'} inverse>
        blue-90
      </Block>
      <Block color={'var(--blue-80)'} inverse>
        blue-80
      </Block>
      <Block color={'var(--blue-70)'} inverse>
        blue-70
      </Block>
    </Row>

    <Row>
      <Block color={'var(--green-90)'} inverse>
        green-90
      </Block>
      <Block color={'var(--green-80)'} inverse>
        green-80
      </Block>
      <Block color={'var(--green-70)'} inverse>
        green-70
      </Block>
    </Row>

    <Row>
      <Block color={'var(--red-90)'} inverse>
        red-90
      </Block>
      <Block color={'var(--red-70)'} inverse>
        red-70
      </Block>
    </Row>
  </div>
)
