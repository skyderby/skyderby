import { MutableRefObject, useEffect, useRef } from 'react'

type CallbackFn = (e: MouseEvent) => unknown
type ElementRefs =
  | MutableRefObject<HTMLElement | null>
  | MutableRefObject<HTMLElement | null>[]

const ensureArray = (value: ElementRefs) => (Array.isArray(value) ? value : [value])

const useClickOutside = (elRefs: ElementRefs, callback: CallbackFn): void => {
  const callbackRef = useRef<CallbackFn>(() => undefined)
  callbackRef.current = callback

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!callbackRef.current) return
      const clickedInside = ensureArray(elRefs).reduce((acc, ref) => {
        return acc || Boolean(ref.current?.contains(e.target as Node))
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
