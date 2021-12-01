import React from 'react'

type OverviewProps = {
  placeId: number
}

const Overview = ({ placeId }: OverviewProps): JSX.Element => {
  return <div>Overview {placeId}</div>
}

export default Overview
