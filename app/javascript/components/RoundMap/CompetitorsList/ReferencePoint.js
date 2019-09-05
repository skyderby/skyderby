import { h } from 'preact'
import styled from 'styled-components'

const ReferencePoint = ({ className, editable, referencePoint }) => {
  if (!referencePoint) return null

  const {
    id,
    name
  } = referencePoint

  return (
    <div className={className}>
      <span>{name}</span>
    </div>
  )
}

export default styled(ReferencePoint)`
  margin-left: auto;
`
