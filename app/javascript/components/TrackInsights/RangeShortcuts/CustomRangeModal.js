import React from 'react'
import { Formik, Field } from 'formik'
import PropTypes from 'prop-types'

import { useI18n } from 'components/TranslationsProvider'
import Label from 'components/ui/Label'
import Input from 'components/ui/Input'
import Modal from 'components/ui/Modal'
import DefaultButton from 'components/ui/buttons/Default'
import PrimaryButton from 'components/ui/buttons/Primary'
import { Fieldset, Footer } from './elements'

const CustomRangeModal = ({
  isShown,
  onHide,
  onChange,
  minAltitude,
  maxAltitude,
  selectedAltitudeRange: [from, to]
}) => {
  const { t } = useI18n()
  const handleSubmit = values => onChange?.([values.from, values.to])

  return (
    <Modal
      isShown={isShown}
      onHide={onHide}
      size="sm"
      title={t('tracks.show.edit_range')}
    >
      <Formik initialValues={{ from, to }} onSubmit={handleSubmit}>
        {({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <Fieldset>
              <Label htmlFor="rangeFrom">{t('tracks.show.range_from')}</Label>
              <Field
                as={Input}
                type="number"
                name="from"
                id="rangeFrom"
                min={minAltitude}
                max={maxAltitude}
              />

              <Label htmlFor="rangeTo">{t('tracks.show.range_to')}</Label>
              <Field
                as={Input}
                type="number"
                name="to"
                id="rangeTo"
                min={minAltitude}
                max={maxAltitude}
              />
            </Fieldset>

            <Footer>
              <PrimaryButton type="submit">{t('general.save')}</PrimaryButton>
              <DefaultButton type="button" onClick={onHide}>
                {t('general.cancel')}
              </DefaultButton>
            </Footer>
          </form>
        )}
      </Formik>
    </Modal>
  )
}

CustomRangeModal.propTypes = {
  minAltitude: PropTypes.number,
  maxAltitude: PropTypes.number,
  selectedAltitudeRange: PropTypes.arrayOf(PropTypes.number).isRequired,
  isShown: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onChange: PropTypes.func
}

export default CustomRangeModal
