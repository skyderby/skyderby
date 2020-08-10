import React, { useState } from 'react'
import PropTypes from 'prop-types'

import Api from 'api'
import FileInput from 'components/ui/FileInput'

import { ErrorMessage } from './elements'

const TrackFileInput = ({ onChange, onUploadStart, onUploadEnd, isInvalid }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState([])

  const clearInput = target => {
    target.value = ''
    target.dispatchEvent(new Event('change', { bubbles: true }))
  }

  const submitFile = async event => {
    const [file] = event.target.files

    if (!file) return

    setErrors([])

    if (file.size > 3000000) {
      setErrors(['File size should not exceed 3MB'])
      clearInput(event.target)

      return
    }

    setIsLoading(true)
    onUploadStart?.()

    try {
      const record = await Api.TrackFile.createRecord(file)

      onChange(record)
    } catch (err) {
      setErrors([err])
    }

    onUploadEnd?.()
    setIsLoading(false)
  }

  return (
    <>
      <FileInput
        accept=".csv,.gpx,.kml,.tes"
        loading={isLoading}
        isInvalid={isInvalid}
        onChange={submitFile}
      />
      {errors.map((error, idx) => (
        <ErrorMessage key={idx}>{error}</ErrorMessage>
      ))}
    </>
  )
}

TrackFileInput.propTypes = {
  onChange: PropTypes.func.isRequired,
  onUploadStart: PropTypes.func,
  onUploadEnd: PropTypes.func,
  isInvalid: PropTypes.bool
}

export default TrackFileInput
