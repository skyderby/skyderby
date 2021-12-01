import React, { useState, useLayoutEffect, forwardRef, ButtonHTMLAttributes } from 'react'
import ReactDOM from 'react-dom'
import { usePopper } from 'react-popper'
import { motion, useAnimation } from 'framer-motion'
import { Options } from '@popperjs/core'

import styles from './styles.module.scss'
import cx from 'clsx'

type DropdownProps = {
  referenceElement: AnyHTMLElement | null
  children: React.ReactNode
  options: Partial<Options>
}

const getPortalRoot = () => {
  const elementId = 'dropdowns-root'
  const existedRoot = document.getElementById(elementId)
  if (existedRoot) return existedRoot

  const createdRoot = document.createElement('div')
  createdRoot.setAttribute('id', elementId)
  document.body.insertAdjacentElement('beforeend', createdRoot)

  return createdRoot
}

const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  ({ referenceElement, children, options }, ref) => {
    const [popperElement, setPopperElement] = useState<HTMLElement>()
    const controls = useAnimation()
    const {
      state,
      styles: { popper: position },
      attributes
    } = usePopper(referenceElement, popperElement, options)

    useLayoutEffect(() => {
      if (!popperElement) return

      popperElement.querySelector('button')?.focus()
    }, [popperElement])

    const setRef = (node: HTMLDivElement): void => {
      setPopperElement(node)

      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    }

    useLayoutEffect(() => {
      if (state === null) return

      controls.set({ scale: 0.9, ...state.modifiersData.popperOffsets })
      controls.start(
        {
          scale: 1,
          ...state.modifiersData.popperOffsets
        },
        { type: 'spring', duration: 0.2 }
      )
    }, [state, controls])

    return ReactDOM.createPortal(
      <motion.div
        animate={controls}
        className={styles.container}
        ref={setRef}
        style={position}
        {...attributes.popper}
      >
        {children}
      </motion.div>,
      getPortalRoot()
    )
  }
)

const Button = ({
  active = false,
  className,
  ...props
}: { active?: boolean } & React.DetailedHTMLProps<
  ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>): JSX.Element => (
  <button className={cx(styles.button, active && styles.active, className)} {...props} />
)

Dropdown.displayName = 'Dropdown'

export default Object.assign(Dropdown, { Button })
