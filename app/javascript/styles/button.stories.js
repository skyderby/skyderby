import React from 'react'
import cx from 'clsx'

import CogIcon from 'icons/cog.svg'
import styles from './button.module.scss'

const Button = () => <button />

export default {
  title: 'styles/Button',
  component: Button,
  argTypes: { onClick: { action: 'clicked' } },
  args: {
    disabled: false
  }
}

const Template = args => <button {...args}>Button text</button>

export const CTA = Template.bind({})

CTA.args = {
  className: cx(styles.button, styles.cta)
}

export const Primary = Template.bind({})

Primary.args = {
  className: cx(styles.button, styles.primary)
}

export const PrimaryOutlined = Template.bind({})
PrimaryOutlined.args = {
  className: cx(styles.button, styles.primary, styles.outlined)
}

export const Red = Template.bind({})
Red.args = {
  className: cx(styles.button, styles.red)
}

export const RedOutlined = Template.bind({})
RedOutlined.args = {
  className: cx(styles.button, styles.red, styles.outlined)
}

export const FAB = args => (
  <button {...args} title="Settings">
    <CogIcon />
  </button>
)
FAB.args = {
  className: cx(styles.button, styles.fab)
}

export const Flat = Template.bind({})
Flat.args = {
  className: cx(styles.button, styles.flat)
}
