import React from 'react'
import { useSuitQuery } from 'api/suits'
import { useManufacturerQuery } from 'api/manufacturer'
import SuitName from './SuitName'

type Props = {
  suitId: number
}

const SuitLabel = ({ suitId }: Props) => {
  const { data: suit } = useSuitQuery(suitId)
  const { data: manufacturer } = useManufacturerQuery(suit?.makeId)

  return <SuitName name={suit?.name} code={manufacturer?.code} />
}

export { SuitName }
export default SuitLabel
