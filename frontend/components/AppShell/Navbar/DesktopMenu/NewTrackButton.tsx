'use client'

import React, { useState } from 'react'

import NewTrackForm from 'components/NewTrackForm'
import styles from './styles.module.scss'

const NewTrackButton = ({ children }: { children: React.ReactNode }) => {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button className={styles.uploadTrack} onClick={() => setShowModal(true)}>
        {children}
      </button>
      <NewTrackForm isShown={showModal} onHide={() => setShowModal(false)} />
    </>
  )
}

export default NewTrackButton
