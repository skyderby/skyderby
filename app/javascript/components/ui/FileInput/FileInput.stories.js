import React from 'react'

import FileInput from './'

export default {
  title: 'components/FileInput',
  component: FileInput,
  decorators: [story => <div style={{ padding: '2rem' }}>{story()}</div>],
  argTypes: {
    onChange: { action: 'onChange' }
  },
  args: {
    loading: false,
    isInvalid: false
  }
}

export const Default = args => <FileInput {...args} />
