import React, { useState } from 'react'
import I18n from 'i18n-js'
import PropTypes from 'prop-types'

import Button from 'components/ui/buttons/Default'
import CustomRangeModal from './CustomRangeModal'
import { Container } from './elements'

const RangeShortcuts = ({
  activity,
  altitudeRange: [minAltitude, maxAltitude] = [],
  selectedAltitudeRange,
  onChange
}) => {
  const [modalShown, setModalShown] = useState(false)

  const setCustomRange = range => {
    onChange?.(range)
    setModalShown(false)
  }

  const isSkydive = activity === 'skydive'

  return (
    <Container>
      {isSkydive && maxAltitude >= 3000 && minAltitude <= 2000 && (
        <Button rounded size="xs" onClick={() => onChange?.([3000, 2000])}>
          3000 – 2000 {I18n.t('units.m')}
        </Button>
      )}
      {isSkydive && maxAltitude >= 2500 && minAltitude <= 1500 && (
        <Button rounded size="xs" onClick={() => onChange?.([2500, 1500])}>
          2500 – 1500 {I18n.t('units.m')}
        </Button>
      )}

      <Button rounded size="xs" onClick={() => setModalShown(true)}>
        Custom range
      </Button>

      <Button rounded size="xs" onClick={() => onChange?.([maxAltitude, minAltitude])}>
        Full jump
      </Button>

      <CustomRangeModal
        minAltitude={minAltitude}
        maxAltitude={maxAltitude}
        selectedAltitudeRange={selectedAltitudeRange}
        isShown={modalShown}
        onHide={() => setModalShown(false)}
        onChange={setCustomRange}
      />
    </Container>
  )
}

RangeShortcuts.propTypes = {
  activity: PropTypes.oneOf(['skydive', 'base']),
  altitudeRange: PropTypes.arrayOf(PropTypes.number).isRequired,
  selectedAltitudeRange: PropTypes.arrayOf(PropTypes.number).isRequired,
  onChange: PropTypes.func
}

export default RangeShortcuts
