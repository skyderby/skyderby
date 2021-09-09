import React, { Fragment, HTMLAttributes } from 'react'

import ChevronRight from 'icons/chevron-right.svg'

import styles from './styles.module.scss'

const Item = (props: HTMLAttributes<HTMLLIElement>): JSX.Element => <li {...props} />

type BreadcrumbsProps = {
  children: typeof Item[]
}

const Breadcrumbs = ({ children }: BreadcrumbsProps): JSX.Element => {
  const elements = [children].flat()

  return (
    <ul className={styles.container}>
      {elements.map((node, idx) => (
        <Fragment key={idx}>
          {idx > 0 && (
            <li>
              <ChevronRight />
            </li>
          )}

          {node}
        </Fragment>
      ))}
    </ul>
  )
}

export default Object.assign(Breadcrumbs, { Item })
