import React from 'react'

import styles from './styles.module.scss'

type SuitLabelProps = {
  name?: string | null
  code?: string
}

const SuitLabel = ({ name, code }: SuitLabelProps): JSX.Element => (
  <span>
    {code && <span className={styles.manufacturerCode}>{code}</span>}
    &nbsp;
    {name && <span>{name}</span>}
  </span>
)

export default SuitLabel
