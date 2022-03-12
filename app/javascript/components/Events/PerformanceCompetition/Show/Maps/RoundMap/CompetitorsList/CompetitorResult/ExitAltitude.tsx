import React from 'react'

import { useI18n } from 'components/TranslationsProvider'

type ExitAltitudeProps = {
  altitude: number | undefined
}

const maxAltitude = 3353
const minAltitude = 3200

const ExitAltitude = ({ altitude }: ExitAltitudeProps) => {
  const { t } = useI18n()
  if (!altitude) return null

  const showWarning = altitude < minAltitude || altitude > maxAltitude

  return (
    <span>
      Exit: {altitude} {t('units.m')}
      {showWarning && (
        <>
          &nbsp;
          <i className="fas fa-exclamation-triangle text-warning" />
        </>
      )}
    </span>
  )
}

export default ExitAltitude
