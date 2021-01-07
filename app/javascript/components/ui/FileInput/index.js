import React, { useRef } from 'react'
import cx from 'clsx'
import PropTypes from 'prop-types'

import LoadingIndicator from './LoadingIndicator'
import styles from './styles.module.scss'

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
        <input type="file" {...props} onChange={handleChange} />
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
