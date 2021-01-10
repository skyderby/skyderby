import React from 'react'

export default {
  title: 'styles/Colors'
}

const Row = props => <div style={{ display: 'flex' }} {...props} />
const Block = style => (
  <div
    style={{
      border: '1px solid #999',
      height: '2rem',
      width: '2rem',
      marginRight: '0.5rem',
      marginBottom: '0.5rem',
      ...style
    }}
  />
)

export const Colors = () => (
  <div style={{ padding: '1rem' }}>
    <h2>Colors</h2>

    <Row>
      <Block backgroundColor={'var(--grey-90)'} />
      <Block backgroundColor={'var(--grey-80)'} />
      <Block backgroundColor={'var(--grey-70)'} />
      <Block backgroundColor={'var(--grey-60)'} />
      <Block backgroundColor={'var(--grey-50)'} />
      <Block backgroundColor={'var(--grey-40)'} />
      <Block backgroundColor={'var(--grey-30)'} />
      <Block backgroundColor={'var(--grey-20)'} />
      <Block backgroundColor={'var(--grey-10)'} />
      <Block backgroundColor={'var(--grey-5)'} />
    </Row>

    <Row>
      <Block backgroundColor={'var(--blue-90)'} />
      <Block backgroundColor={'var(--blue-80)'} />
      <Block backgroundColor={'var(--blue-70)'} />
      <Block backgroundColor={'var(--blue-60)'} />
      <Block backgroundColor={'var(--blue-50)'} />
      <Block backgroundColor={'var(--blue-40)'} />
      <Block backgroundColor={'var(--blue-30)'} />
      <Block backgroundColor={'var(--blue-20)'} />
      <Block backgroundColor={'var(--blue-10)'} />
    </Row>

    <Row>
      <Block backgroundColor={'var(--green-90)'} />
      <Block backgroundColor={'var(--green-80)'} />
      <Block backgroundColor={'var(--green-70)'} />
      <Block backgroundColor={'var(--green-60)'} />
      <Block backgroundColor={'var(--green-50)'} />
      <Block backgroundColor={'var(--green-40)'} />
      <Block backgroundColor={'var(--green-30)'} />
      <Block backgroundColor={'var(--green-20)'} />
      <Block backgroundColor={'var(--green-10)'} />
    </Row>

    <Row>
      <Block backgroundColor={'var(--red-90)'} />
      <Block backgroundColor={'var(--red-80)'} />
      <Block backgroundColor={'var(--red-70)'} />
      <Block backgroundColor={'var(--red-60)'} />
      <Block backgroundColor={'var(--red-50)'} />
      <Block backgroundColor={'var(--red-40)'} />
      <Block backgroundColor={'var(--red-30)'} />
      <Block backgroundColor={'var(--red-20)'} />
      <Block backgroundColor={'var(--red-10)'} />
    </Row>
  </div>
)
