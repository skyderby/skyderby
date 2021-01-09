import React from 'react'

import RadioButtonGroup from './'

const options = [
  { label: 'First option', value: 'first' },
  { label: 'Second option', value: 'second' },
  { label: 'Third option', value: 'third' }
]

export default {
  title: 'components/RadioButtonGroup',
  component: RadioButtonGroup,
  argTypes: {
    onChange: { action: 'onChange' }
  },
  args: {
    options,
    disabled: false,
    value: 'first'
  }
}

export const Default = args => <RadioButtonGroup {...args} />
