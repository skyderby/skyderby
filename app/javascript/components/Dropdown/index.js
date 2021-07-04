import React, { useState, useLayoutEffect, forwardRef } from 'react'
import ReactDOM from 'react-dom'
import { usePopper } from 'react-popper'
import PropTypes from 'prop-types'

import styles from './styles.module.scss'

const Dropdown = forwardRef(({ referenceElement, children, options }, ref) => {
  const [popperElement, setPopperElement] = useState(null)
  const {
    styles: { popper: position },
    attributes
  } = usePopper(referenceElement, popperElement, options)

  useLayoutEffect(() => {
    if (!popperElement) return

    popperElement.querySelector('button').focus()
  }, [popperElement])

  const setRef = node => {
    setPopperElement(node)
    if (ref) ref.current = node
  }

  return ReactDOM.createPortal(
    <div
      className={styles.container}
      ref={setRef}
      style={position}
      {...attributes.popper}
    >
      {children}
    </div>,
    document.getElementById('dropdowns-root')
  )
})

Dropdown.displayName = 'Dropdown'

Dropdown.propTypes = {
  referenceElement: PropTypes.instanceOf(Element).isRequired,
  children: PropTypes.node.isRequired,
  options: PropTypes.object
}

export default Dropdown
