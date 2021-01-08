import React from 'react'

import FileInput from './'

export default {
  title: 'components/FileInput',
  component: FileInput,
  argTypes: {
    onChange: { action: 'onChange' }
  }
}

export const Default = () => <FileInput />
