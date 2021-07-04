import React, { useRef } from 'react'
import cx from 'clsx'
import PropTypes from 'prop-types'

import LoadingIndicator from './LoadingIndicator'
import styles from './styles.module.scss'

const FileInput = ({ loading, isInvalid, onChange, ...props }) => {
  const inputRef = useRef()
  const handleChange = event => {
    const [file] = event.target.files
    inputRef.current.value = file ? file.name : ''
    onChange?.(event)
  }

  return (
    <div
      className={cx(
        styles.inputGroup,
        loading && styles.disabled,
        isInvalid && styles.invalid
      )}
    >
      <input
        className={styles.input}
        readOnly
        type="text"
        disabled={loading}
        ref={inputRef}
      />
      <span className={styles.button}>
        {loading ? <LoadingIndicator /> : <>&hellip;</>}
        <input type="file" onChange={handleChange} {...props} />
      </span>
    </div>
  )
}

FileInput.propTypes = {
  onChange: PropTypes.func,
  loading: PropTypes.bool,
  isInvalid: PropTypes.bool
}

export default FileInput
