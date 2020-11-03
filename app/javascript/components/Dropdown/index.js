import React, { useState, useLayoutEffect } from 'react'
import ReactDOM from 'react-dom'
import { usePopper } from 'react-popper'

import styles from './styles.module.scss'

const Dropdown = ({ referenceElement, children, options }) => {
  const [popperElement, setPopperElement] = useState(null)
  const {
    styles: { popper: position },
    attributes
  } = usePopper(referenceElement, popperElement, options)

  useLayoutEffect(() => {
    if (!popperElement) return

    popperElement.querySelector('button').focus()
  }, [popperElement])

  return ReactDOM.createPortal(
    <div
      className={styles.container}
      ref={setPopperElement}
      style={position}
      {...attributes.popper}
    >
      {children}
    </div>,
    document.getElementById('dropdowns-root')
  )
}

export default Dropdown
