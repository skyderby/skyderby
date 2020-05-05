import React, { useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import { Field } from 'formik'
import I18n from 'i18n-js'

import Input from 'components/ui/Input'
import { useTrackPoints } from 'components/AltitudeRangeSelect'
import { usePageContext } from 'components/PageContext'

import { Section, Description, Controls, TrackChartCard, InputContainer } from './elements'
import AltitudeChart from 'components/AltitudeChart'
import PlotLine from 'components/Highchart/Plotline'

const TrackOffset = ({ setFieldValue, value }) => {
  const { trackId } = usePageContext()
  const points = useTrackPoints(trackId, { trimed: false })

  const handleOnClick = useCallback(
    event => {
      if (event.target.textContent) return
      const offset = Math.round(event.xAxis[0].value * 10) / 10
      setFieldValue('trackOffset', offset)
    },
    [setFieldValue]
  )

  const options = useMemo(
    () => ({
      chart: {
        zoomType: 'x',
        events: {
          click: handleOnClick
        }
      }
    }),
    [handleOnClick]
  )

  const plotLineProps = {
    color: '#FF0000',
    id: 'track-offset',
    width: 2,
    value: Number(value),
    zIndex: 8
  }

  return (
    <Section>
      <Description>
        <h2>{I18n.t('activerecord.attributes.track_videos.track_offset')}</h2>
        <p>{I18n.t('tracks.videos.form.track_offset_description')}</p>
      </Description>
      <Controls>
        <TrackChartCard>
          <AltitudeChart points={points} options={options}>
            {chart => <PlotLine chart={chart} {...plotLineProps} />}
          </AltitudeChart>
        </TrackChartCard>
        <InputContainer>
          <Field as={Input} name="trackOffset" type="number" step="0.1" />
        </InputContainer>
      </Controls>
    </Section>
  )
}

TrackOffset.propTypes = {
  setFieldValue: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
}

export default TrackOffset
