import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'

import Overlay from './Overlay'
import Container from './Container'
import Header from './Header'
import Body from './Body'

const Modal = ({ isShown = false, onHide = () => {}, children }) => {
  const modalRoot = document.getElementById('modal-root')
  const [internalIsShown, setIsShown] = useState(isShown)

  useEffect(() => {
    setIsShown(isShown)
  }, [isShown])

  const handleOverlayClick = e => {
    if (e.target === e.currentTarget) handleHide()
  }

  const handleHide = () => {
    onHide()
    setIsShown(false)
  }

  if (!internalIsShown) return ReactDOM.createPortal(null, modalRoot)

  return ReactDOM.createPortal(
    <Overlay onClick={handleOverlayClick}>
      <Container>
        <Header handleHide={handleHide} />
        <Body>{children}</Body>
        <h1>HELLO</h1>
      </Container>
    </Overlay>,
    modalRoot
  )
}

export default Modal
