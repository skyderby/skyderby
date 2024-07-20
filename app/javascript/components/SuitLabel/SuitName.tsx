import React, { HTMLProps } from 'react'

import styles from './styles.module.scss'

type Props = Omit<HTMLProps<HTMLSpanElement>, 'name'> & {
  name: string | null | undefined
  code: string | null | undefined
}

const SuitLabel = ({ name, code, ...props }: Props) => (
  <span {...props}>
    {code && <span className={styles.manufacturerCode}>{code}</span>}
    &nbsp;
    {name && <span>{name}</span>}
  </span>
)

export default SuitLabel
