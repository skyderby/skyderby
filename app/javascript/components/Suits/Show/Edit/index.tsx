import React from 'react'
import { match } from 'react-router-dom'

import { useSuitQuery } from 'api/suits'
import { useManufacturerQuery } from 'api/manufacturer'

type EditProps = {
  match: match<{ id: string }>
}

const Edit = ({ match }: EditProps): JSX.Element => {
  const suitId = Number(match.params.id)
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
