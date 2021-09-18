import React from 'react'

import PlaceLabel from 'components/PlaceLabel'
import PlaceIcon from 'icons/location.svg'

import styles from './styles.module.scss'

type PlaceProps = {
  placeId?: number | null
  location?: string | null
}

const Place = ({ placeId, location: userProvidedPlaceName }: PlaceProps): JSX.Element => (
  <div className={styles.place}>
    <PlaceIcon />
    <PlaceLabel
      placeId={placeId}
      fallbackName={userProvidedPlaceName}
      refetchEnabled={false}
    />
  </div>
)

export default Place
