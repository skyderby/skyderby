import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import Select from 'react-select'
import PropTypes from 'prop-types'

import { usePageContext } from 'components/PageContext'
import selectStyles from 'styles/selectStyles'

const theme = theme => ({
  ...theme,
  borderRadius: 4,
  spacing: {
    ...theme.spacing,
    controlHeight: 30,
    baseUnit: 2
  }
})

const CompetitorSelect = ({ value, onChange, ...props }) => {
  const [options, setOptions] = useState([])
  const { eventId } = usePageContext()

  const selectedOption = options.find(el => el.value === value.toString())

  const loadOptions = useCallback(async () => {
    const dataUrl = `/api/v1/events/${eventId}/competitors`
    const { data } = await axios.get(dataUrl)

    setOptions(data.map(el => ({ value: el.id.toString(), label: el.name })))
  }, [eventId])

  const handleChange = ({ value }) => {
    onChange(value)
  }

  useEffect(() => {
    loadOptions()
  }, [loadOptions])

  return (
    <Select
      value={selectedOption}
      options={options}
      onChange={handleChange}
      styles={selectStyles}
      theme={theme}
      {...props}
    />
  )
}

CompetitorSelect.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onChange: PropTypes.func.isRequired
}

CompetitorSelect.defaultProps = {
  value: ''
}

export default CompetitorSelect
