import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import cx from 'clsx'
import PropTypes from 'prop-types'

import styles from './styles.module.scss'

const bodyClassName = 'modalShown'
const setBodyScroll = modalShown => {
  if (modalShown) {
    document.querySelector('body').classList.add(bodyClassName)
  } else {
    document.querySelector('body').classList.remove(bodyClassName)
  }
}

const Modal = ({ size = 'md', isShown = false, onHide = () => {}, title, children }) => {
  const [internalIsShown, setIsShown] = useState(isShown)
  const modalRoot = document.getElementById('modal-root')

  useEffect(() => {
    setIsShown(isShown)
    setBodyScroll(isShown)
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

const childrenType = PropTypes.oneOfType([
  PropTypes.arrayOf(PropTypes.node),
  PropTypes.node
])
const Body = ({ children, className }) => (
  <div className={cx(styles.body, className)}>{children}</div>
)
Body.propTypes = { children: childrenType, className: PropTypes.string }

const Footer = ({ children, className }) => (
  <div className={cx(styles.footer, className)}>{children}</div>
)
Footer.propTypes = { children: childrenType, className: PropTypes.string }

Modal.Body = Body
Modal.Footer = Footer

export default Modal
