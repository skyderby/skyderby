import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'

import Overlay from './Overlay'
import Container from './Container'
import Header from './Header'

const Modal = props => {
  const {
    size = 'medium',
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
    if (e.target === e.currentTarget) handleHide()
  }

  const handleHide = e => {
    e.preventDefault()
    onHide()
    setIsShown(false)
  }

  if (!internalIsShown) return ReactDOM.createPortal(null, modalRoot)

  return ReactDOM.createPortal(
    <Overlay onClick={handleOverlayClick}>
      <Container size={size}>
        <Header title={title} handleHide={handleHide} />
        <div>{children}</div>
      </Container>
    </Overlay>,
    modalRoot
  )
}

export default Modal
