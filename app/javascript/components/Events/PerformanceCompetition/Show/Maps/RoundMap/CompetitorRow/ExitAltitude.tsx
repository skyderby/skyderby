import React from 'react'
import Tippy from '@tippyjs/react'

import { useI18n, I18n } from 'components/TranslationsProvider'
import TriangleExclamationIcon from 'icons/triangle-exclamation.svg'
import { metersToFeet } from 'utils/unitsConversion'
import styles from './styles.module.scss'

type ExitAltitudeProps = {
  altitude: number | undefined
}

const maxAltitude = 3353
const maxAltitudeFt = 11000
const minAltitude = 3200
const minAltitudeFt = 10500

const altitudeDescription = (altitude: number) => {
  if (altitude < minAltitude) {
    const difference = Math.round(minAltitude - altitude)
    const differenceFt = Math.round(metersToFeet(difference))

    return `
      Exit altitude is below minimum ${minAltitude} ${I18n.t('units.m')} 
      (${minAltitudeFt} ${I18n.t('units.ft')})
      by ${difference} ${I18n.t('units.m')} 
      (${differenceFt} ${I18n.t('units.ft')}) 
    `
  }

  if (altitude > maxAltitude) {
    const difference = Math.round(altitude - maxAltitude)
    const differenceFt = Math.round(metersToFeet(difference))

    return `
      Exit altitude is above maximum ${maxAltitude} ${I18n.t('units.m')}
      (${maxAltitudeFt} ${I18n.t('units.ft')})
      by ${difference} ${I18n.t('units.m')}
      (${differenceFt} ${I18n.t('units.ft')})
    `
  }
  return ''
}

const ExitAltitude = ({ altitude }: ExitAltitudeProps) => {
  const { t } = useI18n()
  if (!altitude) return null

  const showWarning = altitude < minAltitude || altitude > maxAltitude

  return (
    <Tippy content={altitudeDescription(altitude)} disabled={!showWarning}>
      <span className={styles.exitAltitude}>
        Exit: {altitude} {t('units.m')}
        {showWarning && <TriangleExclamationIcon className={styles.warningIcon} />}
      </span>
    </Tippy>
  )
}

export default ExitAltitude
