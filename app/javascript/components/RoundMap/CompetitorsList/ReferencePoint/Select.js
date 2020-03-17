import React from 'react'
import Select from 'react-select'
import PropTypes from 'prop-types'

const styles = {
  control: base => ({
    ...base,
    width: '5rem'
  }),
  placeholder: base => ({
    ...base,
    fontSize: '12px'
  })
}

const theme = theme => ({
  ...theme,
  spacing: {
    baseUnit: 2,
    menuGutter: 4
  }
})

const ReferencePointSelect = props => {
  const { referencePoints, value: selectedReferencePoint, ...selectProps } = props
  const placeholder = <i className="fa fa-ellipsis-h" />

  const blankOption = { value: undefined, label: placeholder }
  const options = [
    blankOption,
    ...(referencePoints || []).map(({ id, name }) => ({
      value: id,
      label: name
    }))
  ]

  const valueOption =
    selectedReferencePoint && options.find(el => el.value === selectedReferencePoint)

  return (
    <Select
      menuPlacement="auto"
      options={options}
      value={valueOption}
      placeholder={placeholder}
      theme={theme}
      styles={styles}
      {...selectProps}
    />
  )
}

ReferencePointSelect.propTypes = {
  referencePoints: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string
    })
  ).isRequired,
  value: PropTypes.number
}

export default ReferencePointSelect
