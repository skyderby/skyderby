import React from 'react'
import { useSelector } from 'react-redux'

import { createTerrainProfileSelector } from 'redux/terrainProfiles'
import { Tag } from './elements'

const TerrainProfile = ({ terrainProfileId }) => {
  const terrainProfile = useSelector(createTerrainProfileSelector(terrainProfileId))

  if (!terrainProfile) return null

  const { place: { name: placeName }, name } = terrainProfile

  return (
    <Tag>{placeName} - {name}</Tag>
  )
}

export default TerrainProfile
