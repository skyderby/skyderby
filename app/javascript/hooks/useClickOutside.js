import { useEffect, useRef } from 'react'

const ensureArray = value => (Array.isArray(value) ? value : [value])

const useClickOutside = (elRefs, callback) => {
  const callbackRef = useRef()
  callbackRef.current = callback

  useEffect(() => {
    const handleClickOutside = e => {
      if (!callbackRef.current) return
      const clickedInside = ensureArray(elRefs).reduce((acc, ref) => {
        return acc || ref?.current?.contains(e.target)
      }, false)

      if (!clickedInside) {
        callbackRef.current(e)
      }
    }

    document.addEventListener('click', handleClickOutside, true)

    return () => {
      document.removeEventListener('click', handleClickOutside, true)
    }
  }, [elRefs, callbackRef])
}

export default useClickOutside
