import React, { useState } from 'react'

import { TrackFileRecord, useNewTrackFileMutation } from 'api/hooks/tracks'
import FileInput from 'components/ui/FileInput'
import ErrorMessage from 'components/ui/ErrorMessage'
import { useField, FieldAttributes } from 'formik'

interface TrackFileInputProps extends Partial<Omit<FieldAttributes<File>, 'onChange'>> {
  onUploadStart: () => void
  onUploadEnd: () => void
  onChange: (record: TrackFileRecord) => void
  name: string
}

const TrackFileInput = ({
  onUploadStart,
  onUploadEnd,
  onChange,
  name
}: TrackFileInputProps): JSX.Element => {
  const [_field, meta] = useField(name)
  const [validationError, setValidationError] = useState<string | null>(null)

  const { mutate, reset, isLoading, error: serverError } = useNewTrackFileMutation({
    onMutate: () => onUploadStart(),
    onSettled: () => onUploadEnd(),
    onSuccess: record => onChange(record)
  })

  const clearInput = (target: HTMLInputElement) => {
    target.value = ''
    target.dispatchEvent(new Event('change', { bubbles: true }))
  }

  const submitFile = async (event: React.ChangeEvent) => {
    const target = event.target as HTMLInputElement
    const files = target.files
    const file = files?.[0]

    if (!file) return

    reset()
    setValidationError(null)

    if (file.size > 3000000) {
      setValidationError('File size should not exceed 3MB')
      clearInput(target)

      return
    }

    mutate(file)
  }

  return (
    <>
      <FileInput
        accept=".csv,.gpx,.kml,.tes"
        loading={isLoading}
        isInvalid={Boolean(meta.touched && meta.error)}
        onChange={submitFile}
      />
      {validationError && <ErrorMessage>{validationError}</ErrorMessage>}
      {serverError && <ErrorMessage>{serverError.toString()}</ErrorMessage>}
    </>
  )
}

export default TrackFileInput
