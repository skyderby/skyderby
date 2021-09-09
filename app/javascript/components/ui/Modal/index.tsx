import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import cx from 'clsx'

import styles from './styles.module.scss'

const bodyClassName = 'modalShown'
const setBodyScroll = (modalShown: boolean): void => {
  if (modalShown) {
    document.body.classList.add(bodyClassName)
  } else {
    document.body.classList.remove(bodyClassName)
  }
}

const getPortalRoot = () => {
  const elementId = 'modal-root'
  const existedRoot = document.getElementById(elementId)
  if (existedRoot) return existedRoot

  const createdRoot = document.createElement('div')
  createdRoot.setAttribute('id', elementId)
  document.body.insertAdjacentElement('beforeend', createdRoot)

  return createdRoot
}

type ModalSize = 'sm' | 'md' | 'lg'

type ModalProps = {
  size?: ModalSize
  isShown: boolean
  title: string
  onHide?: () => void
  children: React.ReactNode
}

const Modal = ({
  size = 'md',
  isShown = false,
  onHide = () => undefined,
  title,
  children
}: ModalProps): JSX.Element => {
  const [internalIsShown, setIsShown] = useState(isShown)
  const modalRoot = getPortalRoot()

  useEffect(() => {
    setIsShown(isShown)
    setBodyScroll(isShown)

    return () => setBodyScroll(false)
  }, [isShown])

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleHide(e)
  }

  const handleHide = (e: React.MouseEvent) => {
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

type BodyProps = {
  className?: string
  children: React.ReactNode | React.ReactNode[]
}

const Body = ({ children, className }: BodyProps): JSX.Element => (
  <div className={cx(styles.body, className)}>{children}</div>
)

type FooterProps = {
  className?: string
  children: React.ReactNode | React.ReactNode[]
  spaceBetween?: boolean
}

const Footer = ({ children, className, spaceBetween }: FooterProps): JSX.Element => (
  <div className={cx(styles.footer, spaceBetween && styles.spaceBetween, className)}>
    {children}
  </div>
)

Modal.Body = Body
Modal.Footer = Footer

export default Modal
