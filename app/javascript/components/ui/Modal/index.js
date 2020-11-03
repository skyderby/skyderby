import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

import styles from './styles.module.scss'

const Modal = props => {
  const {
    size = 'md',
    isShown = false,
    onHide = () => {},
    title,
    children = null
  } = props

  const modalRoot = document.getElementById('modal-root')
  const [internalIsShown, setIsShown] = useState(isShown)

  useEffect(() => {
    setIsShown(isShown)
  }, [isShown])

  const handleOverlayClick = e => {
    if (e.target === e.currentTarget) handleHide(e)
  }

  const handleHide = e => {
    e.preventDefault()
    onHide()
    setIsShown(false)
  }

  if (!internalIsShown) return ReactDOM.createPortal(null, modalRoot)

  return ReactDOM.createPortal(
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.container} data-size={size}>
        <div className={styles.header}>
          {title}
          <button className={styles.closeButton} onClick={handleHide}>
            ×
          </button>
        </div>

        <div>{children}</div>
      </div>
    </div>,
    modalRoot
  )
}

const Footer = ({ children }) => <div className={styles.footer}>{children}</div>
Footer.propTypes = { children: PropTypes.node }

Modal.Footer = Footer

export default Modal
