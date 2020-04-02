import { useEffect } from 'react'

const useOutsideClickHandler = (ref, callback) => {
  useEffect(() => {
    const clickHandler = e => {
      if (ref.current && !ref.current.contains(e.target)) callback()
    }

    document.addEventListener('mousedown', clickHandler)

    return () => document.removeEventListener('mousedown', clickHandler)
  }, [ref, callback])
}

export default useOutsideClickHandler
