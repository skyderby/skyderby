import React, { useRef } from 'react'
import PropTypes from 'prop-types'

import Button from 'components/ui/buttons/Default'
import Input from 'components/ui/Input'

import InputGroup from './InputGroup'
import LoadingIndicator from './LoadingIndicator'

const FileInput = ({ loading, isInvalid, ...props }) => {
  const inputRef = useRef()
  const handleChange = event => {
    const [file] = event.target.files

    if (file) {
      inputRef.current.value = file.name
    } else {
      inputRef.current.value = ''
    }

    props.onChange?.(event)
  }

  return (
    <InputGroup disabled={loading} isInvalid={isInvalid}>
      <Input readonly type="text" disabled={loading} ref={inputRef} />
      <Button as="span">
        {loading ? <LoadingIndicator /> : <>&hellip;</>}
        <input type="file" {...props} onChange={handleChange} />
      </Button>
    </InputGroup>
  )
}

FileInput.propTypes = {
  onChange: PropTypes.func,
  loading: PropTypes.bool
}

export default FileInput
