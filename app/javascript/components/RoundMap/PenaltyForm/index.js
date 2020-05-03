import React from 'react'
import styled from 'styled-components'
import { useFormik } from 'formik'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { updatePenalty } from 'redux/events/round'
import RadioButtonGroup from 'components/ui/RadioButtonGroup'
import DefaultButton from 'components/ui/buttons/Default'
import PrimaryButton from 'components/ui/buttons/Primary'

const PenaltyForm = ({ resultId, onComplete }) => {
  const dispatch = useDispatch()
  const { penalized, penaltySize, penaltyReason } = useSelector(state =>
    state.eventRound.results.find(({ id }) => id === resultId)
  )

  const { values, handleChange, handleSubmit } = useFormik({
    initialValues: {
      penalized: penalized || false,
      penaltySize: penaltySize || 0,
      penaltyReason: penaltyReason || ''
    },
    onSubmit: values => {
      dispatch(updatePenalty(resultId, values))
      onComplete()
    }
  })

  const penaltyOptions = ['10', '20', '50', '100'].map(value => ({
    value,
    label: `${value} %`
  }))

  return (
    <form onSubmit={handleSubmit}>
      <FormBody>
        <FormGroup>
          <label htmlFor="penalized">Apply penalty</label>
          <input
            name="penalized"
            type="checkbox"
            value="true"
            checked={values.penalized}
            onChange={handleChange}
          />
        </FormGroup>

        <FormGroup>
          <label>Deduction</label>

          <RadioButtonGroup
            name="penaltySize"
            value={values.penaltySize}
            options={penaltyOptions}
            onChange={handleChange}
          />
        </FormGroup>

        <FormGroup>
          <label htmlFor="penaltyReason">Reason</label>
          <input
            name="penaltyReason"
            type="text"
            value={values.penaltyReason}
            onChange={handleChange}
          />
        </FormGroup>
      </FormBody>

      <Footer>
        <PrimaryButton type="submit">{I18n.t('general.save')}</PrimaryButton>
        <DefaultButton onClick={onComplete}>{I18n.t('general.cancel')}</DefaultButton>
      </Footer>
    </form>
  )
}

const FormGroup = styled.div`
  align-items: center;
  display: flex;
  font-family: 'Proxima Nova Regular';
  margin-bottom: 12px;

  > label {
    flex-grow: 0;
    flex-shrink: 0;
    font-family: 'Proxima Nova Semibold';
    margin: 0;
    padding: 0 1rem;
    text-align: right;
    width: 30%;
  }

  input[type='text'] {
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-family: 'Proxima Nova Regular';
    padding: 6px 12px;
    width: 100%;
  }

  input[type='checkbox'] {
    cursor: pointer;
    height: 24px;
    margin: 0;
    width: 24px;
  }
`

const FormBody = styled.div`
  padding: 15px;
`

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--border-color);
  padding: 10px 15px;
`

PenaltyForm.propTypes = {
  resultId: PropTypes.number.isRequired,
  onComplete: PropTypes.func.isRequired
}

export default PenaltyForm
