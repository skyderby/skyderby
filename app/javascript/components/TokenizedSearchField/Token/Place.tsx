import React, { useRef } from 'react'

import { usePlaceQuery } from 'api/hooks/places'
import IconTimes from 'icons/times.svg'
import PlaceLabel from 'components/PlaceLabel'
import styles from './styles.module.scss'

type PlaceProps = {
  value: string | number
  onDelete: (e?: React.MouseEvent) => unknown
  onClick?: (e?: React.MouseEvent) => unknown
}

const Place = ({ value, onClick, onDelete }: PlaceProps): JSX.Element | null => {
  const deleteButtonRef = useRef<HTMLButtonElement>(null)
  const placeId = Number(value)
  const { data: place, isLoading } = usePlaceQuery(placeId)

  if (isLoading) return null

  const handleTokenClick = (e: React.MouseEvent) => {
    const deleteButtonClicked =
      e.target === deleteButtonRef.current ||
      deleteButtonRef.current?.contains(e.target as Node)

    if (deleteButtonClicked) {
      onDelete()
    }

    onClick?.()
  }

  const title = `Place: ${place?.name}`

  return (
    <li className={styles.placeContainer} onClick={handleTokenClick} title={title}>
      <div className={styles.type}>Place</div>
      <div className={styles.value}>
        <PlaceLabel placeId={placeId} />
        <button
          className={styles.deleteButton}
          title="Delete"
          type="button"
          ref={deleteButtonRef}
        >
          <IconTimes />
        </button>
      </div>
    </li>
  )
}

export default Place
