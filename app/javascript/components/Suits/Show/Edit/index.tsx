import React from 'react'

import { useSuitQuery } from 'api/suits'
import { useManufacturerQuery } from 'api/manufacturer'

type EditProps = {
  suitId: number
}

const Edit = ({ suitId }: EditProps): JSX.Element => {
  const { data: suit } = useSuitQuery(suitId)
  const { data: make } = useManufacturerQuery(suit?.makeId)

  return (
    <div>
      <h1>
        Edit {suit?.name} {make?.name}
      </h1>
    </div>
  )
}

export default Edit
