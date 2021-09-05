import React from 'react'
import { motion } from 'framer-motion'

import IconTimes from 'icons/times.svg'

import styles from './styles.module.scss'
import { useTerrainProfileQuery } from 'api/hooks/terrainProfiles'
import { usePlaceQuery } from 'api/hooks/places'

type TerrainProfileTagProps = {
  terrainProfileId: number
  onDelete: (e: React.MouseEvent) => unknown
}

const TerrainProfile = ({
  terrainProfileId,
  onDelete
}: TerrainProfileTagProps): JSX.Element | null => {
  const { data: terrainProfile } = useTerrainProfileQuery(terrainProfileId)
  const { data: place } = usePlaceQuery(terrainProfile?.placeId)

  if (!terrainProfile) return null

  const label = [place?.name, terrainProfile.name].join(' - ')

  return (
    <motion.li
      className={styles.tag}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <span className={styles.label}>{label}</span>
      <button
        className={styles.deleteButton}
        type="button"
        onClick={onDelete}
        aria-label={`Remove ${label}`}
      >
        <IconTimes />
      </button>
    </motion.li>
  )
}

export default TerrainProfile
