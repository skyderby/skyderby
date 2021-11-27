import React, { useState } from 'react'
import type { Story } from '@storybook/react'

import RadioButtonGroup from './'
import { RadioButtonGroupProps } from './'

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
  decorators: [
    (Story: Story) => (
      <div style={{ padding: '2rem' }}>
        <Story />
      </div>
    )
  ],
  args: {
    options,
    disabled: false
  }
}

export const Default = ({ onChange, ...props }: RadioButtonGroupProps) => {
  const [value, setValue] = useState(options[0].value)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    onChange(e)
  }
  return <RadioButtonGroup value={value} onChange={handleChange} {...props} />
}
