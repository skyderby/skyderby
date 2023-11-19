import React from 'react'

import styles from './styles.module.scss'

type Props = {
  name?: string | null
  code?: string | null
}

const SuitLabel = ({ name, code }: Props) => (
  <span>
    {code && <span className={styles.manufacturerCode}>{code}</span>}
    &nbsp;
    {name && <span>{name}</span>}
  </span>
)

export default SuitLabel
