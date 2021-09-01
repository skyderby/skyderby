import React, { useRef } from 'react'
import cx from 'clsx'
import PropTypes from 'prop-types'

import LoadingIndicator from './LoadingIndicator'
import styles from './styles.module.scss'

type FileInputProps = {
  loading?: boolean
  isInvalid?: boolean
  onChange?: (e: React.ChangeEvent) => unknown
}

const FileInput = ({
  loading,
  isInvalid,
  onChange,
  ...props
}: FileInputProps): JSX.Element => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (event: React.ChangeEvent) => {
    const files = (event.target as HTMLInputElement).files
    const file = files ? files[0] : null
    if (inputRef.current) inputRef.current.value = file ? file.name : ''
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
